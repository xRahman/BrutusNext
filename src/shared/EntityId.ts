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

export class EntityId extends SaveableObject
{
  public static get STRING_ID_PROPERTY() { return 'stringId'; }
  public static get TYPE_PROPERTY() { return 'type'; }

  public static state =
  {
    // Initial value - id has been created using new EntityId() without
    // valid parameters passed to constructor. This happens when id is
    // being loaded from file.
    ID_NOT_LOADED: "ID_NOT_LOADED",
    // Entity is valid (not deleted), but not loaded from disk.
    ENTITY_NOT_LOADED: "ENTITY_NOT_LOADED",
    // Entity is loaded from disk and valid (not deleted).
    ENTITY_LOADED: "ENTITY_LOADED",
    // Entity has been deleted, you can't access it anymore.
    ENTITY_DELETED: "ENTITY_DELETED"
  }

  // -------------- Public class data ------------------

  // Variable is named 'status' and not 'state', because
  // 'state' is a static enum and we need static variable
  // of the same name as this variable to mark it as not saveable.
  public status = EntityId.state.ID_NOT_LOADED;
  // Do not save or load variable status.
  private static status = { isSaved: false };

  // -------------- Private class data -----------------

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

      // We have just been passed an entity so it's definitely loaded.
      this.status = EntityId.state.ENTITY_LOADED;

      // Register this id in IdManager.
      this.register();
    }
    else
    {
      this.stringId = null;
      this.entity = null;
      this.type = null;
      this.status = EntityId.state.ID_NOT_LOADED;
    }
  }

  // --------------- Public accessors ------------------

  // ---------------- Public methods --------------------
  
  public async loadEntity()
  {
    ASSERT(this.status === EntityId.state.ENTITY_NOT_LOADED,
      "Attempt to load entity using id " + this.getStringId()
      + " which doesn't have state 'NOT_LOADED'");

    // Creates an instance of correct type based on className property
    // of id (in other words: Type of referenced entity is saved within
    // id and is recreated here).
    let newEntity = Entity.createInstanceFromId(this);

    // Load entity from file.
    await newEntity.load();

    // Add entity id to it's approptiate IdList so it can be searched
    // for by name, aliases, etc.
    newEntity.addToIdList();
  }

  public async saveEntity()
  {
    ASSERT(this.status === EntityId.state.ENTITY_LOADED,
      "Attempt to save entity using id " + this.getStringId()
      + " which doesn't have state 'LOADED'");

    let entity = this.getEntity({ typeCast: Entity });

    if (entity === null)
      // ASSERT has already been thrown by this.getEntity().
      return;

    entity.save();
  }

  // Sets entity to null and state to NOT_LOADED.
  // (Entity will be dealocated from memory but not deleted from disk.)
  public dropEntity()
  {
    ASSERT(this.status === EntityId.state.ENTITY_LOADED,
      "Attempt to drop entity of an id " + this.getStringId()
      + " which doesn't have state LOADED");

    this.status = EntityId.state.ENTITY_NOT_LOADED;
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
    if (this.status !== EntityId.state.ENTITY_LOADED)
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

/*
    // Direct reference is not initialized while loading, because
    // that would enforce certain order of loading (and prevent
    // bidirectional linking of entities using their ids). This means
    // that it may happen that entity is not initialized
    // when getEntity() is called. In that case we need to look
    // the entity up using the string id.
    if (this.updateDirectReference() === null)
      return null;
*/

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

  private register()
  {
    Server.idProvider.register(this);
  }

  /*
  private updateDirectReference(): Entity
  {
    if (this.entity === null)
    {
      // Find referenced entity by string id.
      let entity = Server.idProvider.getEntity(this);

      // This can never happen because it would trigger ASSERT_FATAL
      // in Server.idProvider.get() first, but better be sure...
      if (entity === undefined)
      {
        ASSERT(false,
          "Attempt to reference nonexisting entity of type '"
          + this.type + "' by id '" + this.stringId + "'");

        return null;
      }

      this.entity = entity;
    }

    return this.entity;
  }
  */
}