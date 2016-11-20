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
  after entity is loaded. Until then, you will have a invalid entity
  reference (any access to properties of this reference will be logged
  as error).
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {IdProvider} from '../../shared/entity/IdProvider';

import {Entity} from '../../shared/entity/Entity';
import {NameLockRecord} from '../../shared/entity/NameLockRecord';
///import {UniqueNames} from '../../shared/entity/UniqueNames';
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

  /*
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

  // Shortcut so you can use EntityManager.createEntity()
  // instead of Server.entityManager.createEntity().
  public static createEntity<T>
  (
    className: string,
    typeCast: { new (...args: any[]): T }
  )
  : T
  {
    return Server.entityManager.createEntity(className, typeCast);
  }

  // Shortcut so you can use EntityManager.createNamedEntity()
  // instead of Server.entityManager.createNamedEntity().
  public static async createNamedEntity<T>
  (
    name: string,
    cathegory: NamedEntity.NameCathegory,
    prototype: string,
    typeCast: { new (...args: any[]): T }
  )
  // Return type is actualy <T>, Promise will get resolved automatically.
  : Promise<T>
  {
    return await Server.entityManager.createNamedEntity
    (
      name,
      cathegory,
      prototype,
      typeCast
    );
  }

  // Shortcut so you can use EntityManager.loadNamedEntity()
  // instead of Server.entityManager.loadNamedEntity().
  public static async loadNamedEntity<T>
  (
    name: string,
    cathegory: NamedEntity.NameCathegory,
    typeCast: { new (...args: any[]): T }
  )
  // Return type is actualy <T>, Promise will get resolved automatically.
  : Promise<T>
  {
    return await Server.entityManager.loadNamedEntity
    (
      name,
      cathegory,
      typeCast
    );
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
  */

  // ---------------- Public methods --------------------

  /*
  // Creates THE prototype entity (one and only)
  public async createPrototypeEntity()
  {
    /// TODO:
    /// if (alreadyExists)
    ///   return;

    - měla by to být normální entita se vším všudy - rozhodně s ID,
        rozhodně v EntityManageru.
      - možná ale nepotřebuju Proxy (i když pokud nebude ničemu vadit,
        tak klidně i s Proxy)

  }
  */

  /*
  public async createPrototypeEntity(Class: any)
  {
    /// TODO...
    let prototype = new Class;
    

    // 'null' id means that entity will be based on 'new Entity'
    let entity = this.createEntity(null);
    let cathegory = NamedEntity.NameCathegory.prototypes;

    if (await entity.setUniqueName('Entity', cathegory) === false)
      return null;

    return entity;
  }
  */

  /*
  // Creates uniquelly named entity.
  //   If 'prototypeId' is null, instance will be based on 'new Entity()'
  //   (this is used to create THE prototype entity which is ancestor
  //   to all other entities).
  // -> Returns null if such entity already exists or cannot be created
  //    for other reasons.
  public async createNamedEntity
  (
    name: string,
    cathegory: NamedEntity.NameCathegory,
    prototypeName: string,
  )
  {
    let prototypeId = Server.classFactory.getPrototypeId(prototypeName);

    if (prototypeId === undefined)
    {
      ERROR("Attempt to create unique entity '" + name + "'"
        + " based on prototype '" + prototypeName + "'"
        + " that doesn't exist in ClassFactory");
      return null;
    }

    // Here we are dynamically typecasting to 'NamedEntity' in order
    // to be able to set entity.name.
    let entity = this.createEntity(prototypeId);

    if (await entity.setUniqueName(name, cathegory) === false)
      return null;

    return entity;
  }
  */

  /*
  // Creates uniquelly named entity.
  // -> Returns null if such entity already exists or cannot be created
  //    for other reasons.
  public async createNamedEntity<T>
  (
    name: string,
    cathegory: NamedEntity.NameCathegory,
    prototype: string,
    typeCast: { new (...args: any[]): T }
  )
  // Return type is actualy <T>, Promise will get resolved automatically.
  : Promise<T>
  {
    // Here we are dynamically typecasting to 'NamedEntity' in order
    // to be able to set entity.name.
    let entity = this.createEntity(prototype, NamedEntity);

    if (await entity.setUniqueName(name, cathegory) === false)
      return null;

    // Here we are dynamically typecasting back to requested type.
    //   Indirect call is used because 'dynamicCast' property doesn't
    // exist on entity, it's created by trapping access to 'dynamicCast'
    // property by a proxy.
    return entity.dynamicCast(typeCast);
  }
  */

  /// TODO: Sloučit do loadEntity(cathegory)
  /// - podle kathegory se buď loadne přímo idčko,
  ///   nebo nejdřív přečte name lock file.
  /// Tak asi ne, je to blbost. loadEntity() se provolává z handleru
  /// při odchycení entity.load() - takže už to sloučené defacto je. 
  ///
  // Loads uniquely named entity from file
  // (it must not exist in EntityManager). 
  // -> Returns reference to the loaded entity.
  public async loadNamedEntity
  (
    name: string,
    cathegory: NamedEntity.NameCathegory,
  )
  {
    // In order to load any entity, we need to know it's id.
    // Uniquelly named entities have their id saved in special
    // file on disk, so we need to load id from this file first.
    let id = await this.loadNamedEntityId(name, cathegory);

    if (id === null || id === undefined)
      // Error is already reported by loadNamedEntityId()
      return null;

    return await this.loadEntityById(id);
  }

  /*
  // Loads uniquely named entity from file
  // (it must not exist in EntityManager). 
  // -> Returns reference to the loaded entity.
  public async loadNamedEntity<T>
  (
    name: string,
    cathegory: NamedEntity.NameCathegory,
    typeCast: { new (...args: any[]): T }
  )
  // Return type is actualy <T>, Promise will get resolved automatically.
  : Promise<T>
  {
    // In order to load any entity, we need to know it's id.
    // Uniquelly named entities have their id saved in special
    // file on disk, so we need to load id from this file first.
    let id = await this.loadNamedEntityId(name, cathegory);

    if (id === null || id === undefined)
      // Error is already reported by loadNamedEntityId()
      return null;

    return await this.loadEntityById(id, typeCast);
  }
  */

  public createEntity
  (
    name: string,
    cathegory: NamedEntity.NameCathegory,
    prototypeId: string
  )
  {
    let prototype = this.get(prototypeId, Entity);

    if (prototype === undefined)
    {
      ERROR("Unable to create entity based on prototype id"
        + " '" + prototypeId + "' in cathegory"
        + " '" + NamedEntity.NameCathegory[cathegory] + "'");
      return null;
    }

    return this.createEntityFromPrototype(name, cathegory, prototype);
  }

  public createEntityFromPrototype
  (
    name: string,
    cathegory: NamedEntity.NameCathegory = null,
    prototype: Entity
  )
  {
    // Generate an id for this new entity.
    //////////////////////////////////////////////////////////////
    //  This should be the only place in whole code where new id's
    //  are generated.
    ///////////////////////////////////////////////////////////////
    let id = this.idProvider.generateId();

    let entity = Server.classFactory.createInstance(prototype);

    entity.setId(id);

    let proxy = this.proxify(entity);

    proxy.setName(name, cathegory);

    return proxy;
  }

  // Creates an entity proxy handler for 'entity'.
  // Also adds the proxified entity to the EntityManager.
  private proxify(entity: Entity)
  {
    let handler = new EntityProxyHandler();

    handler.id = entity.getId();
    handler.entity = entity;

    let proxy = new Proxy({}, handler);

    this.add(proxy, handler);

    return proxy;
  }

  /*
  // Creates an entity of type 'className' with a new id.
  //   If 'prototypeId' is null, instance will be based on 'new Entity()'
  //   (this is used to create THE prototype entity which is ancestor
  //   to all other entities).
  // -> Returns entity proxy (which is used instead of entity).
  public createEntity(prototypeId: string)
  {
    // Generate a new id for this new entity.
    //////////////////////////////////////////////////////////////
    //  This should be the only place in whole code where new id's
    //  are generated.
    ///////////////////////////////////////////////////////////////
    let id = this.idProvider.generateId();

    let handler = new EntityProxyHandler();
    let entity = this.createBareEntity(prototypeId, id);

    handler.id = id;
    handler.entity = entity;

    let entityProxy = new Proxy({}, handler);

    this.add(entityProxy, handler);

    return entityProxy;

    ///return entityProxy.dynamicCast(typeCast);
  }
  */

  /*
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

    let loadResult: { jsonObject: Object, prototypeId: string, path: string };
    loadResult = await Entity.loadJsonOject(handler.id);

    if (loadResult.jsonObject === null || loadResult.prototypeId === null)
      // Error is already reported by Entity.loadJsonObject().
      return;

    let prototype = null;

    // Prototype Entity dosn't have a prototype id. 
    if (loadResult.prototypeId === null)
    {
      prototype = new Entity;
    }
    else
    {
      prototype = this.get(loadResult.prototypeId, Entity);
    }

    // Now we can create an instance of the correct class.
    /*
    let entity =
      Server.classFactory.createPrototypeInstance(loadResult.prototypeId);
    */
    let entity =
      Server.classFactory.createInstance(prototype);

    // And let it load itself from jsonObject.
    if (!entity.loadFromJsonObject(loadResult.jsonObject, loadResult.path))
      return;

    // Update internal entity reference of our entity proxy handler. 
    handler.entity = entity;

    // Also update entity's id.
    // (id is not saved to file, because it is used as file name so there
    //  would be unnecessary duplicity).
    entity.setId(handler.id);

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

  /// TODO: Zrušit
  ///
  /*
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
  */

  // Removes entity from manager but doesn't delete it from disk
  // (this is used for example when player quits the game).
  // Also removes entity from entity lists so it can no longer
  // be searched for.
  public remove(entity: Entity)
  {
    if (entity === null || entity === undefined)
    {
      ERROR("Attempt to remove 'null' or 'undefined'"
        + " entity from EntityManager");
      return;
    }

    // Remove entity from entity lists so it can no longer be searched for.
    entity.removeFromLists();

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
  //    Returns 'undefined' if entity doesn't exist in EntityManager.
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

  /// TODO: Asi to sloučit s get() - get prostě bude vždycky
  /// vracet referenci.
  /// - loadnout invalid referenci je ok. Není ok updatovat invalid
  ///   referenci, když v manageru už je jiná reference pro stejné id.
  ///
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

  /*
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
  */

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

  /*
  // Creates a new instance of entity based on prototype specified by
  // 'prototypeId' and with an id 'entityId'.
  //   If 'prototypeId' is null, instance will be based on 'new Entity()'
  //   (this is used to create THE prototype entity which is ancestor
  //   to all other entities).
  private createBareEntity(prototypeId: string, entityId: string): Entity
  {
    let entity = Server.classFactory.createPrototypeInstance(prototypeId);

    entity.setId(entityId);

    return entity;
  }
  */

  /*
  // Creates a new instance of entity of type stored in handler.type.
  // Sets handler.id as id of a newly created entity instance.
  // -> Returns a new instance of entity (not a proxy).
  private createBareEntity(className: string, id: string): Entity
  {
    let entity: Entity = Server.classFactory.createInstance(className, Entity);

    entity.setId(id);

    return entity;
  }
  */

  // Loads entity id from file corresponding to unique entity
  // name and it's unique names cathegory.
  // -> Returns id loaded from file.
  //    Returns null in case of failure.
  private async loadNamedEntityId
  (
    name: string,
    cathegory: NamedEntity.NameCathegory
  )
  {
    // File path is something like './data/names/accounts/Rahman.json'.
    let path = NamedEntity.getNameLockFilePath(name, cathegory);

    let idRecord = new NameLockRecord();

    await idRecord.loadFromFile(path);

    if (idRecord.id === null || idRecord.id === undefined)
    {
      ERROR("Failed to load id from file " + path);
      return null;
    }

    return idRecord.id;
  }

  private async loadEntityById(id: string)
  {
    // First check if such entity already exists in EntityManager.
    let entity = this.get(id, Entity);

    // If it does, there is no point in loading it - any unsaved changes
    // would be lost.
    if (entity !== undefined)
    {
      ERROR("Attempt to load entity " + entity.getErrorIdString()
        + " which already exists in EntityManager. Returning"
        + " existing entity");
      return entity;
    }

    entity = this.createInvalidEntityReference(id, Entity);

    // This works because entity is a proxy and 'load()' call
    // is trapped by the handler. 'load()' handler will also add
    // entity to the manager.
    await entity.load();

    return entity;
  }

  /*
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
        + " which already exists in EntityManager. Returning"
        + " existing entity");
      return entity.dynamicCast(typeCast);
    }

    entity = this.createInvalidEntityReference(id, Entity);

    // This works because entity is a proxy and 'load()' call
    // is trapped by the handler. 'load()' handler will also add
    // entity to the manager.
    await entity.load();

    return entity.dynamicCast(typeCast);
  }
  */
}