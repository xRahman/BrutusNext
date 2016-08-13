/*
  Part of BrutusNEXT

  Unique entity identifier.

  Use 'null' as a 'not pointing anywhere' id value. Id can be invalid
  even if it's not null, for example when it's pointing to an object
  which has already been deleted.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {Server} from '../server/Server';
import {SaveableObject} from '../shared/SaveableObject';
import {Entity} from '../shared/Entity';

export class EntityId extends SaveableObject
{
  public static get STRING_ID_PROPERTY() { return 'stringId'; }
  public static get TYPE_PROPERTY() { return 'type'; }

  // -------------- Private class data -----------------

  // Class name of entity referenced by this id.
  private type: string = null;
  private stringId: string = null;

  // Direct reference to entity referenced by this id.
  private entity: Entity = null;
  // Do not save variable 'entity'.
  private static entity = { isSaved: false };

  // True if referenced entity has been deleted from disk.
  private entityDeleted = false;

  constructor(stringId: string, entity: Entity)
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;

    if (stringId !== undefined && entity !== undefined)
    {
      // We will assign an id anyways if this happens, but it is an
      // error nevertheless and it must be fixed.
      ASSERT(entity.getId() === null,
        "Attempt to create an id for an entity that already has an id");

      this.stringId = stringId;
      this.entity = entity;
      this.type = entity.className;

      // Register this id in IdManager.
      this.register();
    }
    else
    {
      this.stringId = null;
      this.entity = null;
      this.type = null;
    }
  }

  // --------------- Public accessors ------------------

  public isEntityDeleted()
  {
    return this.entityDeleted;
  }

  // True if entity is loaded in memory and not flagged as deleted.
  public isEntityValid()
  {
    return this.entity !== null && this.entityDeleted === false;
  }

  // ---------------- Public methods --------------------
  
  public async loadEntity()
  {
    // There is no point in loading a deleted entity.
    if (this.entityDeletedCheck() === true)
      return;

    // Creates an instance of correct type based on className property
    // of id (in other words: Type of referenced entity is saved within
    // id and is recreated here).
    let entity = this.createEntity();

    // Set this.entityDeleted to 'true' and this.entity to 'null' if
    // entity save file doesn't exist.
    if (this.saveExistsCheck(entity) === false)
      return;

    // Load entity from file.
    await entity.load();

    // This must be done after entity.load(), because loading of an entity
    // takes some time.
    this.entity = entity;

    // Add entity id to it's approptiate IdList so it can be searched
    // for by name, aliases, etc.
    entity.addToIdList();
  }

  public async saveEntity()
  {
    // Deleted entity won't be saved.
    if (this.entityDeletedCheck() === true)
      return;

    let entity = this.getEntity({ typeCast: Entity });

    if (entity === null)
      // ASSERT has already been thrown by this.getEntity().
      return;

    entity.save();
  }

  // Entity will be dealocated from memory but not deleted from disk.
  public dropEntity()
  {
    this.entity = null;
  }

  // Returns direct reference to object identified by this id.
  // If this reference is null (for example if referenced entity
  // hasn't been created yet or if it has already been deleted),
  // fatal assert is triggered (so you know that you have referenced
  // something invalid).
  public getEntity<T>(param: { typeCast: { new (...args: any[]): T } }): T
  {
    if (this.entityNotDeletedCheck() === false)
      return null;

    if (this.referenceValidCheck() === false)
      return null;

    // Dynamic type check - we make sure that our referenced object
    // is an instance of requested class or some of it's ancestors.
    if (!ASSERT(this.entity instanceof param.typeCast,
        "Type cast error: Direcly referenced entity "
        + "(id: '" + this.stringId + "' is not an instance"
        + " of requested type (" + param.typeCast.name + ")"))
      return null;

    // Here we typecast to <any> in order to pass this.entity
    // as type T (you can't typecast directly to template type but you can
    // typecast to <any> which is then automatically cast to template type).
    return <any>this.entity;
  }

  public getStringId() { return this.stringId; }
  public getType() { return this.type; }

  public equals(operand: EntityId)
  {
    ASSERT(operand.stringId !== null
        && operand.stringId !== "",
      "Attempt to compare to an invalid id");

    ASSERT(this.stringId !== null
        && this.stringId !== "",
      "Attempt to compare an invalid id");

    if (this.stringId !== operand.stringId)
      return false;

    return true;
  }

  // Performs checks to ensure that saved id with the same stringId
  // really matches this id.
  public checkAgainstJsonObject(jsonObject: Object, filePath: string)
  {
    let type = jsonObject[EntityId.TYPE_PROPERTY];

    if (!ASSERT(type !== undefined,
        "Missing '" + EntityId.TYPE_PROPERTY + "' in id"
        + " '" + this.stringId + "' loaded from file " + filePath))
      return;

    ASSERT(this.type === type,
      "Property '" + EntityId.TYPE_PROPERTY + "' in id '" + this.stringId + "'"
      + " loaded from file " + filePath + " doesn't match existing id"
      + " with the same stringId");
  }

  // ---------------- Private methods ------------------- 

  // Register this id in Server.idProvider.
  private register()
  {
    Server.idProvider.register(this);
  }

  // Creates an instance of entity of type 'this.type'.
  // 'args' are passed to entity constructor.
  private createEntity(...args: any[]): Entity
  {
    let entity = SaveableObject.createInstance
    (
      {
        className: this.getType(),
        typeCast: Entity
      },
      args
    );

    // Entity remembers it's id.
    entity.setId(this);

    return entity;
  }

  // Returns true if entityDeleted flag is set to true.
  // In that case also checks that this.entity is null.
  private entityDeletedCheck(): boolean
  {
    if (this.isEntityDeleted())
    {
      if (!ASSERT(this.entity !== null,
        "Entity " + this.entity.getErrorIdString()
        + " is flagged as deleted on it's id " + this.getStringId()
        + " but id.entity is not null. Setting id.entity to null"))
      {
        this.entity = null;
      }
   
      return true;
    }

    return false;
  }

  // Set this.entityDeleted to 'true' and this.entity to 'null' if
  // entity save file doesn't exist.
  private saveExistsCheck(entity: Entity): boolean
  {
    if (entity.saveExists() === false)
    {
      // We are trying to load an entity which doesn't have a save file.
      //   This can happen because id can be saved when entity had still
      // existed and loaded after entity had been deleted. In this case
      // this.entityDeleted is false but entity save file doesn't exist.

      // We need to update 'entityDeleted' flag.
      this.entityDeleted = true;
      // And our reference to an entity as well.
      this.entity = null;      

      return false;
    }

    return true;
  }

  private entityNotDeletedCheck(): boolean
  {
    if (this.isEntityDeleted())
    {
      if (this.entity === null)
      {
        ASSERT(false,
          "Attempt to dereference id " + this.getStringId()
          + " which has 'entityDeleted' set to 'false' even"
          + " though it's entity reference is not null");
      }
      else
      {
        ASSERT(false,
          "Attempt to dereference id " + this.getStringId()
          + " that references a deleted entity");
      }

      return false;
    }

    return true;
  }

  private referenceValidCheck(): boolean
  {
    if (!ASSERT(this.entity !== null,
        "Attempt to dereference id " + this.getStringId()
        + " which doesn't have a valid 'entity' reference."
        + " entity must be loaded from disk before id.getEntity()"
        + " can be used"))
      return false;

    return true;
  }
}