/*
  Part of BrutusNEXT

  Implements container to store instances of entities identified by
  unique string ids.
*/

/*
  All instances of entities (accounts, connections, characters, rooms, etc.)
  need to be held only in in Server.entityManager. Entities are not referenced
  directly but through their Proxy object (see EntityProxyHandler.ts) so if
  you access deleted entity, an error message will be logged.
*/

/*
  Note:
    There is no 'add()' method. If you want to add an existing entity
  to EntityManager, use:

    let entity = Server.entityManager.get(id, type);

  Then you can do:

    if (!entity.isValid())
      entity.load();

  to load it from the disk. Entity record is only added to EntityManager
  after entity is loaded. Untill then, you will have a invalid entity
  reference (any access to properties of this reference will be logged
  as error).
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {IdProvider} from '../../shared/entity/IdProvider';
import {Entity} from '../../shared/entity/Entity';
import {EntityRecord} from '../../shared/entity/EntityRecord';
import {NamedEntity} from '../../shared/entity/NamedEntity';
import {EntityProxyHandler} from '../../shared/entity/EntityProxyHandler';
import {SaveableObject} from '../../shared/fs/SaveableObject';
import {Server} from '../../server/Server';

// 3rd party modules.

// This module allows using new ES6 Proxy API through old harmony API
// (it allows us to call 'new Proxy(target, handler)').
///var Proxy = require('harmony-proxy');

export class EntityManager
{
  // -------------- Private class data -----------------

  // Hashmap<[ string, EntityRecord ]>
  //   Key: string id
  //   Value: { entity proxy, list of entity proxy handlers }
  private entityRecords = new Map();

  private idProvider = null;

  constructor(timeOfBoot: Date)
  {
    this.idProvider = new IdProvider(timeOfBoot);
  }

  // ------------- Public static methods ----------------

  // Shortcut so you can use EntityManager.createNamedEntity()
  // instead of Server.entityManager.createNamedEntity().
  public static createNamedEntity<T>
  (
    name: string,
    prototype: string,
    typeCast: { new (...args: any[]): T }
  )
  : T
  {
    return Server.entityManager.createNamedEntity(name, prototype, typeCast);
  }

  // ---------------- Public methods --------------------

  public createNamedEntity<T>
  (
    name: string,
    prototype: string,
    typeCast: { new (...args: any[]): T }
  )
  : T
  {
    // Here we are dynamically typecasting to 'NamedEntity' in order
    // to be able to set entity.name.
    let entity = this.createEntity(prototype, NamedEntity);

    entity.name = name;

    // Here we are dynamically typecasting back to requested type.
    //   Indirect call is used because 'dynamicCast' property doesn't
    // exist on entity, it's created by trapping access to 'dynamicCast'
    // property by a proxy.
    return entity.dynamicCast(typeCast);
  }

  // Creates an entity of type 'className' with a new id.
  // -> Returns entity proxy (which is used instead of entity).
  public createEntity<T>
  (
    className: string,
    typeCast: { new (...args: any[]): T }
  )
  : T
  {
    let handler = new EntityProxyHandler();

    // Generate a new id for this new entity.
    // Note:
    //  This should be the only place in whole code where new id's
    //  are generated.
    handler.id = this.idProvider.generateId();
    handler.type = className;

    let entity = this.createBareEntity(handler);

    handler.entity = entity;

    let entityProxy = new Proxy({}, handler);
    let entityRecord = new EntityRecord(entity, entityProxy, handler);

    // Add newly created entity record to hashmap under entity's string id.
    this.entityRecords.set(handler.id, entityRecord);

    return entityProxy.dynamicCast(typeCast);
  }

  // Loads entity from file. Don't use this method, call entity.load() instead
  // (this method is automatically called by entity proxy handler when you
  // call load() method on your entity reference).
  // (You shouldn't be able to call this method anyways, because you
  // (hopefuly) have no way to get your hands on an entity proxy handler).
  public async loadEntity(handler: EntityProxyHandler)
  {
    handler.sanityCheck();

    // Note:
    //   If entity already exists and we are re-loading it, the
    // procedure is the same as if we are loading from invalid
    // entity handler: A new entity will be created and all
    // existing references to it will be updated.
    //   It means that the old entity will be discarded - which is
    // ok, because noone should have direct refrerence to an entity,
    // everyone else than EntityManager is only allowed to keep
    // reference to an entity proxy, so noone will really notice the
    // change of internal entity reference inside a proxy handler.

    let entity = await this.createAndLoadEntity(handler);

    if (entity === null)
      // Errors have already been reported by this.createAndLoadEntity().
      return;

    // From now on, we will work with an id that has been loaded from file.
    // (If handler had a different id, it was reported to mudlog in
    //  this.createAndLoadEntity. 'handler.id' will get updated later
    //  for all handlers stored in the entityRecord.)
    let id = entity.getId();

    // Check if id already exist in EntityManager.
    // ('this.entityRecords.get()' returns undefined if there
    //  is no such record in 'this.entityRecords')
    let entityRecord: EntityRecord = this.entityRecords.get(id);

    // If there is no entityRecord for our id in EntityManager,
    // a new entityRecord will be created.
    if (entityRecord === undefined)
    {
      let entityProxy = new Proxy({}, handler);

      entityRecord = new EntityRecord(entity, entityProxy, handler);
    }
    else
    {
      // Ensure that handler is listed in existing entityRecord.
      entityRecord.addHandler(handler);
    }

    // Update all handlers in entityRecord with (possibly) new
    // information: id, entity type and entity reference.
    entityRecord.updateProxyHandlers(id, entity.className, entity);
  }

  // This method is used by etity handler when it's internal
  // entity reference is null.
  // -> Returns entity proxy if entity is available.
  //    Returns undefined otherwise.
  public updateReference(handler: EntityProxyHandler)
  {
    let entityRecord: EntityRecord = this.entityRecords.get(handler.id);

    if (entityRecord === undefined)
      return undefined;

    // When a handler is asking to update it's reference, it means
    // that the entity had been removed from EntityManager and than
    // readded to it (it happens for example when player quits the
    // game and logs back again). In that case we need to remember
    // this old handler to which a new reference will be issued,
    // so we can invalidate the reference when entity is removed
    // from EntityManager again.
    entityRecord.addHandler(handler);

    // This will return an entity proxy.
    return entityRecord.getEntityProxy();
  }

  // Removes entity from manager but doesn't delete it
  // (this is used for example when player quits the game).
  public remove(entity: Entity)
  {
    // get() returns undefined if there is no such record in hashmap.
    let entityRecord = this.entityRecords.get(entity.getId());

    if (entityRecord === undefined)
    {
      ERROR("Attempt to remove entity " + entity.getErrorIdString()
        + " from EntityManager which is not present in the manager");
      return;
    }

    // Remove a record from hashmap (so when anyone ask for this
    // entity using it's string id, he will get undefined).
    if (this.entityRecords.delete(entity.getId()) === false)
    {
      ERROR("Failed to delete record '" + entity.getId() + "' from"
        + " EntityManager");
    }

    // IMPORTANT: This must be done after deleting a record from
    // EntityManager, because entity is actualy a proxy and accessing
    // 'getId' property on it would lead to updateReference() call,
    // which would fail, because entity reference in proxyhandler would
    // already by null but entityRecord would still be present in
    // EntityManager.

    // Set all proxy handlers of this entity to null (so anyone who
    // still has a reference to entity proxy will know that entity is
    // no longer valid).
    entityRecord.invalidate();
  }

  // -> Returns entity proxy matching given id, undefined if entity
  //    doesn't exist in EntityManager.
  public get(id: string, type: string): Entity
  {
    // 'type' is needed even if 'id' is null, because
    // we need to know what class to instantiate in order to load
    // the record from file.
    if (type === null || type === undefined)
    {
      ERROR("Missing of invalid 'type' argument");
      return null;
    }

    // This check is done first so we save ourself searching a 'null'
    // record in hashmap.
    if (id === null)
    {
      // This case is used for example when loading world. Wold is
      // saved to a special filename (wold.json), so we don't need
      // to know it's id in order to load it. In fact, world's id
      // is loaded from it's save file.
      return this.createInvalidEntityProxy(id, type);
    }

    let entityRecord: EntityRecord = this.entityRecords.get(id);

    // If an entity with this 'id' already exists in hashmap,
    // return it's existing proxy.
    if (entityRecord !== undefined)
    {
      let entityProxy = entityRecord.getEntityProxy();

      if (entityProxy === undefined || entityProxy === null)
      {
        ERROR("Invalid entity proxy in entity record of"
          + " entity with id " + id);
      }

      if (entityProxy.className !== type)
      {
        ERROR("Type of entity " + entityProxy.getErrorStringId()
          + " doesn't match requested type '" + type + "'");
      }

      return entityProxy;
    }

    return this.createInvalidEntityProxy(id, type);
  }

  // Check if entity exists in EntityManager.
  public has(id: string): boolean
  {
    return this.entityRecords.has(id);
  }

  // --------------- Private methods -------------------

  private createInvalidEntityProxy(id: string, type: string): Entity
  {
    let handler = new EntityProxyHandler();

    handler.id = id;
    handler.type = type;
    // Set handler.entity to null.
    handler.invalidate();

    let entityProxy = new Proxy({}, handler);

    return entityProxy;
  }

  // Creates a new instance of entity of type stored in handler.type.
  // Sets handler.id as id of a newly created entity instance.
  // -> Returns a new instance of entity (not a proxy).
  private createBareEntity(handler: EntityProxyHandler): Entity
  {
    if (handler.type === null)
    {
      ERROR("Invalid 'type' on entity proxy handler."
        + " Entity is not created");
      return null;
    }

    // Here we assign 'undefined' on purpose. We will test if 'name'
    // is 'undefined' later.
    let name = undefined;

    if (handler.entity !== null)
    {
      // If entity has a name, we need to remember it because it might
      // be needed for loading entity from file (for example accounts
      // are saved to files named <AccountName>.json).
      // (If entity doesn't have a name, value of 'name' will be 'undefined'.)
      name = handler.entity['name'];
    }

    // TODO: Nežádat o instanci SaveableObject, ale DynamicClassFactory
    let entity: Entity = SaveableObject.createInstance
      ({ className: handler.type, typeCast: Entity });

    // Set the old name back if entity had a name before.
    if (name !== undefined)
    {
      if (entity['name'] === undefined)
      {
        ERROR("Entity " + entity.getErrorIdString()
          + " doesn't have a 'name' property even though"
          + " it had it before it was re-created"); 
      }

      entity['name'] = name;
    }

    // We need to set entity.id prior to loading so the save path can
    // be constructed (filename contains id for most entities).
    entity.setId(handler.id);

    return entity;
  }

  private async createAndLoadEntity(handler: EntityProxyHandler)
  {
    if (handler.type === null)
    {
      ERROR("Invalid 'type' on entity proxy handler."
        + " Entity s not created and loaded");
      return null;
    }

    let entity = this.createBareEntity(handler);

    await entity.load();

    if (entity.getId() === null)
    {
      ERROR("Entity " + entity.getErrorIdString() + " doesn't have an"
        + " id in it's save file. There must be an id saved in every"
        + " entity save file. Entity is not updated in EntityManager");

      // If we don't know entity's id, we can't add it to EntityManager.
      return null;
    }

    if (handler.id !== null)
    {
      if (handler.id !== entity.getId())
      {
        ERROR("Id of entity " + entity.getErrorIdString() + " loaded"
          + " from file doesn't match id " + handler.id + " saved in"
          + " entity proxy handler");
        return null;
      }
    }

    return entity;
  }
}