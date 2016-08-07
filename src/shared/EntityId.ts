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

  public static entityState =
  {
    // Initial value - we don't know yet.
    UNKNOWN: "UNKNOWN",
    // Entity is loaded from disk and valid (not deleted).
    LOADED: "LOADED",
    // Entity is valid (not deleted), but not loaded from disk.
    NOT_LOADED: "NOT_LOADED",
    // Entity has been deleted, you can't access it anymore.
    DELETED: "DELETED"
  }

  // -------------- Protected class data ----------------

  // Direct reference to entity referenced by this id.
  // It's used for faster performance - you should always hold ids instead of
  // direct references, but you can use id.getEntity() to get your reference
  // directly without the need to search for string value of id in your
  // object container.
  protected directReference: Entity = null;
  // Do not save variable 'directReference'.
  protected static directReference = { isSaved: false };

  // Variable is named 'status' and not 'entityState', because
  // 'entityState' is a static enum and we need static variable
  // of the same name as this variable to mark it as not saveable.
  private status = EntityId.entityState.UNKNOWN;
  // Do not save or load variable status.
  private static status = { isSaved: false };

  // stringId is a unique string.
  // type is the name of the class this id points to.
  constructor
  (
    protected stringId: string,
    // Type of object referenced by this id.
    protected type: string,
    // Direct reference to object attached to this id.
    // It's used for faster performance - you should always hold ids instead of
    // direct references, but you can use id.getObject() to get your reference
    // directly without the need to search for string value of id in your
    // object container.
    object: Entity
  )
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;

    // Parameter 'object' will be undefined if constructor is called
    // dynamically (that happens when loading from file). In that case
    // we will leave it at default value (which is 'null').
    if (object !== undefined)
      this.directReference = object;
  }

  // --------------- Public accessors ------------------

  public getEntityState() { return this.status; }

  // ---------------- Public methods --------------------

  
  public async loadEntity()
  {
    ASSERT(this.getEntityState() === EntityId.entityState.NOT_LOADED,
      "Attempt to load entity using id " + this.getStringId()
      + " which doesn't have entityState 'NOT_LOADED'");

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
    ASSERT(this.getEntityState() === EntityId.entityState.LOADED,
      "Attempt to save entity using id " + this.getStringId()
      + " which doesn't have entityState 'LOADED'");

    let entity = this.getEntity({ typeCast: Entity });

    if (entity === null)
      // ASSERT has already been thrown by this.getEntity().
      return;

    entity.save();
  }

  // Sets directReference to null and entityState to NOT_LOADED.
  public dropEntity()
  {
    ASSERT(this.getEntityState() === EntityId.entityState.LOADED,
      "Attempt to drop entity of an id " + this.getStringId()
      + " which doesn't have entityState LOADED");

    this.status = EntityId.entityState.NOT_LOADED;
    this.directReference = null;
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
    // Direct reference is not initialized while loading, because
    // that would enforce certain order of loading (and prevent
    // bidirectional linking of entities using their ids). This means
    // that it may happen that directReference is not initialized
    // when getEntity() is called. In that case we need to look
    // the entity up using the string id.
    if (this.updateDirectReference() === null)
      return null;

    // Dynamic type check - we make sure that our referenced object
    // is inherited from requested class (or an instance of the class itself).
    if (!ASSERT(this.directReference instanceof param.typeCast,
        "Type cast error: Direcly referenced entity "
        + "(id: '" + this.stringId + "' is not an instance"
        + " of requested type (" + param.typeCast.name + ")"))
      return null;

    // Here we typecast to <any> in order to pass this.directReference
    // as type T (you can't typecast directly to template type but you can
    // typecast to <any> which is then automatically cast to template type).
    return <any>this.directReference;
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

  /// TODO: Checkovat this.getEntityState()
  //// Checks if entity still exists.
  //public isValid(): boolean
  //{
  //  // TODO: Nebude to tak jednoduché, viz TODO :\

  //  // If direct reference still exists, 
  //  if (this.directReference !== null)
  //    return true;

  //  return false;
  //}

  // ---------------- Private methods ------------------- 

  private updateDirectReference(): Entity
  {
    if (this.directReference === null)
    {
      // Find referenced entity by string id.
      let entity = Server.entities.get(this);

      // This can never happen because it would trigger ASSERT_FATAL
      // in Server.entities.getItem() first, but better be sure...
      if (entity === undefined)
      {
        ASSERT(false,
          "Attempt to reference nonexisting entity of type '"
          + this.type + "' by id '" + this.stringId + "'");

        return null;
      }

      this.directReference = entity;
    }

    return this.directReference;
  }
}