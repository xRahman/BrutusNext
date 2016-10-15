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
    There is no public 'add()' method. If you want to add an existing entity
  to EntityManager, use:

    let entity = EntityManager.createReference(id);

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
import {IdRecord} from '../../shared/entity/IdRecord';
import {UniqueNames} from '../../shared/entity/UniqueNames';
import {EntityRecord} from '../../shared/entity/EntityRecord';
import {NamedEntity} from '../../shared/entity/NamedEntity';
import {NameSearchList} from '../../shared/entity/NameSearchList';
import {EntityProxyHandler} from '../../shared/entity/EntityProxyHandler';
import {SaveableObject} from '../../shared/fs/SaveableObject';
import {Server} from '../../server/Server';

// 3rd party modules.

// This module allows using new ES6 Proxy API through old harmony API
// (it allows us to call 'new Proxy(target, handler)').
///var Proxy = require('harmony-proxy');

export class EntityManager
{
  //------------------ Private data ---------------------

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

  // -> Returns entity proxy matching given id.
  //    Returns undefined if entity doesn't exist in EntityManager.
  public static get<T>
  (
    id: string,
    typeCast: { new (...args: any[]): T }
  )
  : T
  {
    return Server.entityManager.get(id, typeCast);
  }

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

  // Shortcut so you can use EntityManager.loadNamedEntity()
  // instead of Server.entityManager.loadNamedEntity().
  public static async loadNamedEntity<T>
  (
    name: string,
    cathegory: UniqueNames.Cathegory,
    typeCast: { new (...args: any[]): T }
  )
  // Return type is actualy <T>, Promise will get resolved automatically.
  : Promise<T>
  {
    return await Server.entityManager.
      loadNamedEntity(name, cathegory, typeCast);
  }

  // -> Returns existing reference if entity already exists in EntityManager.
  //    Returns invalid reference if entity with such id doen't exist yet.
  //      (you can then use entity.load() to load if from disk)
  public static createReference<T>
  (
    id: string,
    typeCast: { new (...args: any[]): T }
  )
  : T
  {
    return Server.entityManager.createReference(id, typeCast);
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
    /// TODO: Check unikátnosti jména
    /// TODO: uniqueNamesCathegory (aby šlo checknout unikátnost jména).

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

  // Loads uniquely named entity from file
  // (it must not exist in EntityManager yet). 
  // -> Returns reference to the loaded entity.
  public async loadNamedEntity<T>
  (
    name: string,
    cathegory: UniqueNames.Cathegory,
    typeCast: { new (...args: any[]): T }
  )
  // Return type is actualy <T>, Promise will get resolved automatically.
  : Promise<T>
  {
    // Names are unique only within each cathegory, so you can have
    // account named Rahman and also character named Rahman.
    let cathegoryName = UniqueNames.Cathegory[cathegory];

    // In order to load any entity, we need to know it's id.
    // Uniquelly named entities have their id saved in special
    // file on disk, so we need to load id from this file first.
    let id = await this.loadNamedEntityId(name, cathegoryName);

    if (id === null || id === undefined)
      // Error is already reported by loadNamedEntityId()
      return null;

    // Now we know the id of our named entity.
    // Before we load it from the disk, we better
    // that it doesn't already exist in EntityManager.  
    let entity = this.get(id, Entity);

    // If entity already exists in EntityManager, there
    // is no point in loading it from the disk.
    if (entity !== undefined)
    {
      ERROR("Attempt to load entity " + entity.getErrorIdString()
        + " which is already loaded in EntityManager");
      return entity.dynamicCast(typeCast);
    }

    return await this.loadEntityById(id, typeCast);
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
    // Generate a new id for this new entity.
    // Note:
    //  This should be the only place in whole code where new id's
    //  are generated.
    let id = this.idProvider.generateId();

    let handler = new EntityProxyHandler();
    let entity = this.createBareEntity(className, id);

    handler.id = id;
    handler.entity = entity;

    let entityProxy = new Proxy({}, handler);

    this.add(entityProxy, handler);

    return entityProxy.dynamicCast(typeCast);
  }

  /*
  // Loads entity from file. Don't use this method, call entity.load() instead
  // (this method is automatically called by entity proxy handler when you
  // call load() method on your entity reference).
  // (You shouldn't be able to call this method anyways, because you
  // (hopefuly) have no way to get your hands on an entity proxy handler).
  public async loadEntity(handler: EntityProxyHandler)
  {
    handler.sanityCheck();

    /// Tohle je asi blbost. Když přeloaduju entitu, tak tím zruším
    /// nesavnuté změny - to může být pořeba při editování, ale za běhu
    /// hry to není žádoucí.

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
    // information: entity reference and entity id.
    entityRecord.updateProxyHandlers(entity);
  }
  */

  // Loads entity from file. Don't use this method, call entity.load() instead
  // (this method is automatically called by entity proxy handler when you
  // call load() method on your entity reference).
  // (You shouldn't be able to call this method anyways, because you
  // (hopefuly) have no way to get your hands on an entity proxy handler).
  public async loadEntity(handler: EntityProxyHandler, proxy: Entity)
  {
    handler.sanityCheck();

    if (handler.id === null || handler.id === undefined || handler.id === "")
    {
      ERROR("Invalid id in proxy handler, unable to load entity");
      return;
    }

    // Note: Both 'handler.entity !== null' and 'this.has(handler.id)'
    // say the same thing, because each existing instance of an entity
    // should have a record in EntityManager, but you never know what
    // can go wrong so we better check both. 
    if (handler.entity !== null || this.has(handler.id))
    {
      ERROR("It is not possible to load entity"
        + " " + handler.entity.getErrorIdString()
        + " because it is already loaded in memory"
        + " - all unsaved changes would be lost."
        + " If you really need to lose unsaved changes"
        + " on this entity, remove() it from EntityManager"
        + " to delete it from memory and then call load()"
        + " on it. Entity is not modified");
      return;
    }

    let loadResult: { jsonObject: Object, className: string }
       = Entity.loadJsonOject(handler.id);

    if (loadResult.jsonObject === null || loadResult.className === null)
      // Error is already reported by Entity.loadJsonObject().
      return;

    // Now we can create an instance of the correct class.
    let entity =
      Server.classFactory.createInstance(loadResult.className, Entity);

    // And let it load itself from jsonObject.
    entity.loadFromJsonObject(loadResult.jsonObject);

    // Update internal entity reference of our entity proxy handler. 
    handler.entity = entity;

    // Add entity to EntityManager
    // (we have checked before that our id doesn't exist in the
    // manager yet, so it's safe to do so).
    // Note:
    //   Here we are reusing reference to proxy that was passed to
    //   us as parameter by 'load()' trap handler in EntityProxyHandler,
    //   so we don't create a duplicit proxy reference to the same entity.
    this.add(proxy, handler);

    // Note: 
    //   We don't have to update proxy handlers inside entityRecord
    // here, because we have just checked that there has been no record
    // for our entity in the manager before. So we have just created
    // a new entityRecord (by calling this.add()) and it only contains
    // the handler we have just passed to it, that has it's internal
    // entity reference updated.
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

  // Removes entity from manager but doesn't delete it from disk
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

  // -> Returns entity proxy matching given id.
  //    Returns undefined if entity doesn't exist in EntityManager.
  public get<T>
  (
    id: string,
    typeCast: { new (...args: any[]): T }
  )
  : T
  {
    /*
    // 'type' is needed even if 'id' is null, because
    // we need to know what class to instantiate in order to load
    // the record from file.
    if (type === null || type === undefined)
    {
      ERROR("Missing of invalid 'type' argument");
      return undefined;
    }
    */

    // This check is done first so we save ourself searching a 'null'
    // record in hashmap.
    if (id === null || id === undefined || id === "")
    {
      ERROR("Invalid id");
      return undefined;
    }

    let entityRecord: EntityRecord = this.entityRecords.get(id);
    
    if (entityRecord === undefined)
      return undefined;

    // Now we know that the record for the entity with this 'id' exists
    // in hashmap, so we will return it's existing proxy. But let's do
    // some sanity checks first.

    let entityProxy = entityRecord.getEntityProxy();

    if (entityProxy === undefined || entityProxy === null)
    {
      ERROR("Invalid entity proxy in entity record of"
        + " entity with id " + id);
    }

    /*
    if (entityProxy.className !== type)
    {
      ERROR("Type of entity " + entityProxy.getErrorStringId()
        + " doesn't match requested type '" + type + "'");
    }
    */

    return entityProxy.dynamicCast(typeCast);
  }

  // Check if entity exists in EntityManager.
  public has(id: string): boolean
  {
    return this.entityRecords.has(id);
  }

  // -> Returns existing reference if entity already exists in EntityManager.
  //    Returns invalid reference if entity with such id doen't exist yet.
  //      (you can then use entity.load() to load if from disk)
  public createReference<T>
  (
    id: string,
    typeCast: { new (...args: any[]): T }
  )
  : T
  {
    // Check of null or undefined id first to save us searching in hashmap
    // (null id is used for example for loading world or accounts, because
    // their id is not known until it's loaded from disk.)
    if (id === null || id === undefined)
      return this.createInvalidEntityReference(id, typeCast);

    if (this.has(id))
      return this.get(id, typeCast);

    return this.createInvalidEntityReference(id, typeCast);
  } 

  // --------------- Private methods -------------------

  // Adds entity to the manager.
  private add(entityProxy: Entity, handler: EntityProxyHandler)
  {
    let entity = handler.entity;

    if (entity === null)
    {
      ERROR("Attempt to add <null> entity to EntityManager. That is not"
        + " allowed. There may only be existing entity instances in the"
        + " manager. Record is not added");
      return;
    }

    let entityRecord = new EntityRecord(entity, entityProxy, handler);

    // Add newly created entity record to hashmap under entity's string id.
    this.entityRecords.set(handler.id, entityRecord);
  }

  createInvalidEntityProxy<T>
  (
    id: string,
    handler: EntityProxyHandler,
    typeCast: { new (...args: any[]): T }
  )
  : T
  {
    handler.id = id;
    // Set handler.entity to null.
    handler.invalidate();

    let entityProxy = new Proxy({}, handler);

    // Note: We don't add invalid reference to the manager.
    // Only existing entity instances are added - which invalid
    // reference doesn't have.

    return entityProxy;
  }

  // Purposedly creates an invalid reference
  private createInvalidEntityReference<T>
  (
    id: string,
    typeCast: { new (...args: any[]): T }
  )
  : T
  {
    let handler = new EntityProxyHandler();

    return this.createInvalidEntityProxy(id, handler, typeCast);
  }

  // Creates a new instance of entity of type stored in handler.type.
  // Sets handler.id as id of a newly created entity instance.
  // -> Returns a new instance of entity (not a proxy).
  private createBareEntity(className: string, id: string): Entity
  {
    /*
    if (handler.type === null)
    {
      ERROR("Invalid 'type' on entity proxy handler."
        + " Entity is not created");
      return null;
    }
    */

    /*
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
    */

    let entity: Entity = Server.classFactory.createInstance(className, Entity );

    /*
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
    */

    entity.setId(id);

    return entity;
  }

  /*
  private async createAndLoadEntity(handler: EntityProxyHandler)
  {
    /// if (handler.type === null)
    /// {
    ///   ERROR("Invalid 'type' on entity proxy handler."
    ///     + " Entity s not created and loaded");
    ///   return null;
    /// }


    ///let entity = this.createBareEntity(handler);
    ///await entity.load();

    let entity = await handler.loadEntity();

    if (entity.getId() === null || entity.getId() === undefined)
    {
      ERROR("Entity " + entity.getErrorIdString() + " doesn't have an"
        + " id in it's save file. There must be an id saved in every"
        + " entity save file. Entity is not updated in EntityManager");

      // If we don't know entity's id, we can't add it to EntityManager.
      return null;
    }

    if (handler.id !== null && handler.id !== entity.getId())
    {
      ERROR("Id of entity " + entity.getErrorIdString() + " loaded"
        + " from file doesn't match id " + handler.id + " in entity"
        + " proxy handler");
      return null;
    }

    return entity;
  }
  */

  // Loads entity id from file corresponding to unique entity
  // name and it's unique names cathegory.
  // -> Returns id loaded from file.
  //    Returns null in case of failure.
  private async loadNamedEntityId(name: string, cathegory: string)
  {
    // File path is something like '/data/accounts/Rahman.json'.
    let filePath = "/data/" + cathegory + "/" + name + ".json";

    let idRecord = new IdRecord();

    await idRecord.loadFromFile(filePath);

    if (idRecord.id === null || idRecord.id === undefined)
    {
      ERROR("Failed to load id from file " + filePath);
      return null;
    }

    return idRecord.id;
  }

  private async loadEntityById<T>
  (
    id: string,
    typeCast: { new (...args: any[]): T }
  )
  // Return type is actualy <T>, Promise will get resolved automatically.
  : Promise<T>
  {
    // First check if such entity already exists in EntityManager.
    let entity = this.get(id, Entity);

    // If it does, there is no point in loading it - any unsaved changes
    // would be lost.
    if (entity !== undefined)
    {
      ERROR("Attempt to load entity " + entity.getErrorIdString()
        + " which already exists in EntityManager");
      return entity.dynamicCast(typeCast);
    }

    /*
    let handler = new EntityProxyHandler();

    /// TODO: Možná je to blbost - entity.load() asi musí
    // umět přidat entitu do manageru

    // We don't use createInvalidEntityReference here, because
    // we need to know the handler in order to be able to add
    // newly created entity to the manager.
    entity = this.createInvalidEntityProxy(id, handler, Entity);

    // This will work, because entity is a proxy and 'load()' call
    // is trapped by the handler.
    await entity.load();

    // Add newly created entity to the manager.
    this.add(entity, handler);
    */

    entity = this.createInvalidEntityReference(id, Entity);

    // This will work, because entity is a proxy and 'load()' call
    // is trapped by the handler. 'load()' handler will also add
    // entity to the manager.
    await entity.load();

    return entity.dynamicCast(typeCast);
  }
}