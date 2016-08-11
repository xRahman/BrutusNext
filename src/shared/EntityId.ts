/*
  Part of BrutusNEXT

  Unique identifier.

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

/*
enum State
{
  // Initial value - id has been created using new EntityId() without
  // valid parameters passed to constructor. This happens when id is
  // being loaded from file.
  ID_NOT_LOADED,
  // Entity is valid (not deleted), but not loaded from disk.
  ENTITY_NOT_LOADED,
  // Entity is loaded from disk and valid (not deleted).
  ENTITY_LOADED,
  // Entity has been deleted, you can't access it anymore.
  ENTITY_DELETED
}
*/

export class EntityId extends SaveableObject
{
  /*
  // Enum cannot be declared inside a class in current version of Typescript,
  // but it can be assigned as static class variable. This allows using
  // EntityId.State as if enum had been declared right here. 
  public static State = State;
  */

  public static get STRING_ID_PROPERTY() { return 'stringId'; }
  public static get TYPE_PROPERTY() { return 'type'; }

  // -------------- Public class data ------------------

  /*
  // Variable is named 'status' and not 'state', because
  // 'state' is a static enum and we need static variable
  // of the same name as this variable to mark it as not saveable.
  public state = State.ID_NOT_LOADED;
  // Do not save or load variable status.
  private static state = { isSaved: false };
  */

  // -------------- Private class data -----------------

  private entityDeleted = false;

  // Class name of entity referenced by this id.
  private type: string = null;
  private stringId: string = null;

  // Direct reference to entity referenced by this id.
  private entity: Entity = null;
  // Do not save variable 'entity'.
  private static entity = { isSaved: false };

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

      /*
      // We have just been passed an entity so it's definitely loaded.
      this.state = EntityId.State.ENTITY_LOADED;
      */

      // Register this id in IdManager.
      this.register();
    }
    else
    {
      this.stringId = null;
      this.entity = null;
      this.type = null;
      /*
      this.state = EntityId.State.ID_NOT_LOADED;
      */
    }
  }

  // --------------- Public accessors ------------------

  public isEntityDeleted() { return this.entityDeleted; }

  // ---------------- Public methods --------------------
  
  public async loadEntity()
  {
    /*
    ASSERT(this.state === EntityId.State.ENTITY_NOT_LOADED,
      "Attempt to load entity using id " + this.getStringId()
      + " which doesn't have state 'ENTITY_NOT_LOADED'");
    */

    // Creates an instance of correct type based on className property
    // of id (in other words: Type of referenced entity is saved within
    // id and is recreated here).
    let entity = this.createEntity();

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
    /*
    ASSERT(this.state === EntityId.State.ENTITY_LOADED,
      "Attempt to save entity using id " + this.getStringId()
      + " which doesn't have state 'ENTITY_LOADED'");
    */

    let entity = this.getEntity({ typeCast: Entity });

    if (entity === null)
      // ASSERT has already been thrown by this.getEntity().
      return;

    entity.save();
  }

  // Entity will be dealocated from memory but not deleted from disk.
  public dropEntity()
  {
    /*
    ASSERT(this.state === EntityId.State.ENTITY_LOADED,
      "Attempt to drop entity of an id " + this.getStringId()
      + " which doesn't have state LOADED");

    this.state = EntityId.State.ENTITY_NOT_LOADED;
    */

    this.entity = null;
  }

  // Returns direct reference to object identified by this id.
  // If this reference is null (for example if referenced entity
  // hasn't been created yet or if it has already been deleted),
  // fatal assert is triggered (so you know that you have referenced
  // something invalid).
  public getEntity<T>
  (
    param: { typeCast: { new (...args: any[]): T } }
  )
  : T
  {
    /*
    if (this.state !== EntityId.State.ENTITY_LOADED)
    {
      if (this.entity !== null)
      {
        ASSERT(false,
          "Attempt to dereference id " + this.getStringId()
          + " which does have a loaded entity but it's internal"
          + " state says otherwise. Returning id.entity anyways,"
          + " but this must be fixed, it's potentially dangerous");
      } else
      {
        ASSERT(false,
          "Attempt to dereference id " + this.getStringId()
          + " which doesn't have a loaded entity");

        return null;
      }
    }
    */

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

      return null;
    }

    // Dynamic type check - we make sure that our referenced object
    // is inherited from requested class (or an instance of the class itself).
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
    ASSERT(operand.stringId !== "", "Attempt to compare to an invalid id");
    ASSERT(this.stringId !== "", "Attempt to compare an invalid id");

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
        "Missing '" + EntityId.TYPE_PROPERTY + "' in id '" + this.stringId + "'"
        + " loaded from file " + filePath))
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
}