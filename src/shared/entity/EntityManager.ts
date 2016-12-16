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
import {EntityRecord} from '../../shared/entity/EntityRecord';
import {PrototypeEntity} from '../../shared/entity/PrototypeEntity';
import {NamedEntity} from '../../shared/entity/NamedEntity';
import {NameSearchList} from '../../shared/entity/NameSearchList';
import {EntityProxyHandler} from '../../shared/entity/EntityProxyHandler';
import {SaveableObject} from '../../shared/fs/SaveableObject';
import {Server} from '../../server/Server';

export class EntityManager
{
  //------------------ Private data ---------------------

  // Hashmap<[ string, EntityRecord ]>
  //   Key: string id
  //   Value: { entity proxy, list of entity proxy handlers }
  private entityRecords = new Map();

  constructor(private idProvider: IdProvider)
  {    
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

    return await this.loadEntity(id);
  }

  // Creates entity, loads it from file and adds it to the manager
  // (entity must not exist in the manager before loading).
  // -> Returns 'null' if loading fails.
  public async loadEntity(id: string)
  {
    // First check if such entity already exists in EntityManager
    // (get() returns 'undefined' if entity is not found).
    let entity = this.get(id, Entity);

    // If it does, there is no point in loading it - any unsaved changes
    // would be lost.
    if (entity !== undefined)
    {
      this.reportEntityExists(entity);
      return entity;
    }

    entity = await this.createAndLoadEntity(id);

    // Create a proxy object for 'entity' and add it to the manager.
    return this.addEntityAsProxy(entity);
  }

  /*
  public createEntity<T>
  (
    name: string,
    typeCast: { new (...args: any[]): T }
  )
  : Entity;

  public createEntity<T>
  (
    name: string,
    typeCast: { new (...args: any[]): T },
    cathegory: NamedEntity.NameCathegory
  )
  : Entity;

  public createEntity<T>
  (
    name: string,
    typeCast: { new (...args: any[]): T },
    prototypeId: string
  )
  : Entity;
  */

  public createEntity<T>
  (
    name: string,
    // Either a prototype entity id, or a class (like Account).
    typeCast: { new (...args: any[]): T },
    // If 'cathegory' is 'null', the name won't be unique.
    cathegory: NamedEntity.NameCathegory = null,
    // If 'prototypeId' is 'null', 'typeCast' will be used as prototype.
    prototypeId: string = null
  )
  : T
  {
    // In order to create entity from harcoded class (like Account),
    // 'prototypeId' parameter is omitted (or null). Class name of
    // 'typeCast' parameter will be used instead of 'prototypeId' to
    //  identify the prototype object.
    if (prototypeId === null)
      prototypeId = typeCast.name;

    let prototypeObject = Server.classFactory.getPrototypeObject(prototypeId);

    if (prototypeObject === undefined)
    {
      ERROR("Unable to create entity '" + name + "' based"
        + " on prototype '" + prototypeId + "'");
      return null;
    }

    let entity = this.createEntityFromPrototype
    (
      name,
      cathegory,
      prototypeObject
    );

    // Dynamic cast means runtime check that 'entity' really is inherited
    // from the type we are casting to. IT also changes the type of return
    // value to the type of 'typeCast' parameter. It means that typescript
    // will allow you to access properties of that type on returned 'entity'. 
    return entity.dynamicCast(typeCast);
  }

  /// Prozatím entity.load() úplně disabluju.
  /*
  /// TODO: Předělat (nebo úplně zrušit entity.load()).
  // Loads entity from file. Don't use this method, call entity.load() instead
  // (this method is automatically called by entity proxy handler when you
  // call load() method on your entity reference).
  // (You shouldn't even be able to call this method anyways, because you
  // (hopefuly) have no way to get your hands on an entity proxy handler).
  public async loadExistingEntityProxy(handler: EntityProxyHandler, proxy: Entity)
  {
    if (!handler.sanityCheck())
    {
      ERROR("Invalid id in proxy handler, unable to load entity");
      return;
    }

    if (this.entityExists(handler))
      // Error is already reported by entityExists().
      return;

    // Note: 'null' prototypeId is allowed, because the root prototype
    // entity doesn't have any prototype.
    let loadResult: { jsonObject: Object, prototypeId: string, path: string };

    // First we load jsonObject from the entity save file and read 
    // 'prototypeId' from it.
    loadResult = await Entity.loadJsonOject(handler.id);
    
    if (loadResult.jsonObject === null)
      // Error is already reported by Entity.loadJsonObject().
      return;

    // Now we load entity from json object and assign it to
    // our entity proxy handler.
    handler.entity = this.loadEntityFromJsonObject
    (
      loadResult.prototypeId,
      loadResult.jsonObject,
      loadResult.path,
      handler.id
    );

    // Finaly we add the entity to EntityManager
    // (we have checked before that our id doesn't exist
    //  in the manager yet, so it's safe to do so).
    // Note:
    //   Here we are reusing reference to proxy that was passed to
    //   us as parameter by 'load()' trap handler in EntityProxyHandler,
    //   so we can be sure that we are not creating a duplicit proxy
    //   reference to the same entity.
    this.addProxy(proxy, handler);

    // Note: 
    //   We don't have to update proxy handlers inside entityRecord
    // here, because we have checked that there has been no record
    // for our entity in the manager before. So we have just created
    // a new entityRecord (by calling this.add()) and it only contains
    // the handler we have just passed to it, that has it's internal
    // entity reference updated.
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

  /// Tohohle se taky chci zbavit.
  /// - Tak nakonec ne. Je to potřeba, když se loaduje reference
  ///   ze souboru.
  /// - loadnout invalid referenci je ok. Není ok updatovat invalid
  ///   referenci, když v manageru už je jiná reference pro stejné id.
  ///
  // -> Returns existing reference if entity already exists in EntityManager.
  //    Returns invalid reference if entity with such id doen't exist yet.
  //      (you can then use entity.load() to load if from disk)
  public createReference(id: string): Entity
  {
    /*
    // Check of null or undefined id first to save us searching in hashmap
    // (null id is used for example for loading world or accounts, because
    // their id is not known until it's loaded from disk.)
    if (id === null || id === undefined)
      return this.createInvalidEntityReference(id, typeCast);
    */

    if (this.has(id))
      return this.get(id, Entity);

    return this.createInvalidEntityReference(id);
  }

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


  // --------------- Private methods -------------------

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

  // Adds entity proxy to the manager.
  private addProxy(proxy: Entity, handler: EntityProxyHandler)
  {
    let entity = handler.entity;

    if (entity === null)
    {
      ERROR("Attempt to add <null> entity to EntityManager. That is not"
        + " allowed. There may only be existing entity instances in the"
        + " manager. Record is not added");
      return;
    }

    let entityRecord = new EntityRecord(proxy, handler);

    // Add newly created entity record to hashmap under entity's string id.
    this.entityRecords.set(handler.id, entityRecord);
  }

  // Creates an entity proxy with null 'internalEntity'.
  // Doesn't add it to the manager - so if you want to use
  // this reference, you have to call .getCurrentReference()
  // first and .isValid() next to check if it became valid.
  private createInvalidEntityReference(id: string)
  {
    let handler = new EntityProxyHandler();

    handler.id = id;

    // Set handler.entity to null.
    handler.invalidate();

    let proxy = new Proxy({}, handler);

    return proxy;
  }

  // Loads entity id from file corresponding to unique entity
  // name and it's unique names cathegory.
  // -> Returns id loaded from file or 'null' in case of failure.
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

  /// Tohle už je taky obsolete - místo toho je
  /// ClassFactory.getPrototypeObject().
  /*
  // -> Returns entity specified by 'prototypeId' or a new Entity
  //    if 'prototypeId' is null (that should only be true for
  //    the root prototype entity).
  private getPrototype(prototypeId: string)
  {
    // The root prototype Entity dosn't have a prototype id. 
    if (prototypeId === null)
    {
      // Prorotype object of the root prototype entity is not an entity
      // proxy and is not stored in EntityManager, only the root prototype
      // entity itself is proxified and stored in EntityManager.
      return new Entity;
    }

    // With the exception of the root prototype entity, prototype
    // object is always some other entity - so we just need to
    // retreive it from the EntityManager.
    return this.get(prototypeId, Entity);
  }
  */

  // -> Returns prototype id read from 'jsonObject', 'null' if it's not there. 
  private readPrototypeIdFromJsonObject
  (
    jsonObject: Object,
    // 'path' is passed just to make error messages more informative.
    path: string
  )
  {
    if (jsonObject === null || jsonObject === undefined)
    {
      ERROR("Invalid json object loaded from file"
        + " " + path + " Entity is not loaded");
      return null;
    }

    let prototypeId = jsonObject[PrototypeEntity.PROTOTYPE_ID_PROPERTY]; 

    if (prototypeId === undefined || prototypeId === null)
    {
      ERROR("Missing or uninitialized 'prototypeId' property in file"
        + " " + path + ". Entity is not loaded");
      return null;
    }

    return prototypeId;
  }

  // -> Returns prototype object matching prototypeId in 'jsonObject'
  //    or 'null' if the property isn't valid.
  private getPrototypeForJsonObject(jsonObject: Object, path: string)
  {
    let prototypeId = this.readPrototypeIdFromJsonObject(jsonObject, path);

    if (prototypeId === null)
      // Error is already reported by readPrototypeIdFromJsonObject().
      return null;

    let prototypeObject = Server.classFactory.getPrototypeObject(prototypeId);

    if (prototypeObject === undefined)
    {
      ERROR("Cannot find prototype object for prototype"
        + " " + prototypeId + ". Entity is not loaded");
      return null;
    }

    return prototypeObject;
  }

  // Creates an instance of an entity, loads it from 'jsonObject'
  // and sets 'entityId' to it. Doesn't create a proxy object.
  // Doesn't add the entity to the manager.
  // -> Returns loaded entity (not a proxy) or 'null' on load failure. 
  private loadEntityFromJsonObject
  (
    jsonObject: Object,
    id: string,
    // 'path' is passed just to make error messages more informative.
    path: string
  )
  : Entity
  {
    let prototypeObject = this.getPrototypeForJsonObject(jsonObject, path);

    if (prototypeObject === null)
      // Error is already reported by getPrototypeForJsonObject().
      return null

    // Now we can create an instance based on the prototype object.
    let entity = Server.classFactory.createInstance(prototypeObject);

    // And let it load itself from jsonObject.
    // ('path' is passed just to make error messages more informative)
    if (!entity.loadFromJsonObject(jsonObject, path))
      return null;

    // Also update entity's id.
    // (it is not saved to file, because id is used as file
    //  name so there would be unnecessary duplicity).
    entity.setId(id);

    return entity;
  }

  private reportEntityExists(entity: Entity)
  {
    ERROR("It is not possible to load entity"
      + " " + entity.getErrorIdString() + " because it"
      + " is already loaded in EntityManager. All unsaved"
      + " changes would be lost. If you really need to lose"
      + " unsaved changes on this entity, remove() it from"
      + " EntityManager and then call EntityManager.loadEntity()."
      + " Entity is not loaded");
  }

  /// Tohle bych ideálně neměl potřebovat - ale asi si udělám
  /// podobnou funkci, která se bude volat z createEntity().
  /*
  // -> Returns true if entity referenced by handler already exists
  //    in memory or in EntityManager.
  private entityExists(handler: EntityProxyHandler): boolean
  {
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
      return true;
    }

    return false;
  }
  */

  // Creates a new entity based on 'prototypeObject', encapsulates
  // the result in a javascript proxy object to trap access to invalid
  // entity and adds the proxy to the manager.
  // -> Returns the proxy that should be used to access the entity.
  private createEntityFromPrototype
  (
    name: string,
    cathegory: NamedEntity.NameCathegory,
    prototypeObject: Entity
  )
  {
    // Generate an id for this new entity.
    let id = this.idProvider.generateId();

    // Note that entity is not really an instance in the sense of
    // 'new Class', but rather an empty object with prototypeObject
    // set as it's prototype using Object.create(). It's non-primitive
    // properties are also instantiated like this. This way, any property
    // not set to entity after it's creation is actually read from the
    // prototypeObject, which means that if you edit a prototype,
    // changes will propagate to all entities instantiated from it,
    // which don't have that property overriden. 
    let entity = Server.classFactory.createInstance(prototypeObject);

    if (entity['setId'] === undefined)
    {
      ERROR("Attempt to create entity '" + name + "' from prototype which"
        + " is not an instance of Entity class or it's descendants");
      return null;
    }

    entity.setId(id);

    let proxy = this.addEntityAsProxy(entity);

    proxy.setName(name, cathegory);

    return proxy;
  }

  // Creates an entity proxy handler for 'entity', than
  // adds the proxy to the manager.
  // -> Returns the proxy that should be used to access the entity.
  private addEntityAsProxy(entity: Entity)
  {
    if (entity === null || entity === undefined)
    {
      ERROR("Invalid value of parameter 'entity'");
      return null;
    }

    let handler = new EntityProxyHandler();

    handler.id = entity.getId();
    handler.entity = entity;

    // Create a Javascript Proxy Object that will trap access
    // of entity properties (using EntityProxyHandler we have
    // just created) and report en error if an invalid (deleted)
    // entity is accessed.
    let proxy = new Proxy({}, handler);

    // Add the proxy to the manager.
    this.addProxy(proxy, handler);

    return proxy;
  }

  // -> Returns 'null' if loading fails.
  private async createAndLoadEntity(id: string)
  {
    let path = Entity.getSavePath(id);

    // We need to load contents of save file to JSON object first,
    // so we can read prototype id from it.
    let jsonObject = await SaveableObject.loadJsonObjectFromFile(path);

    if (jsonObject === null)
      // Error is already reported by SaveableObject.loadJsonObjectFromFile().
      return null;

    // Read prototype id from 'jsonObject', create a new entity
    // based on that prototype and load it from jsonObject.
    return this.loadEntityFromJsonObject(jsonObject, id, path);
  }

  // This auxiliary function handles parameter overloading.
  // 'prototype' can either be a string entity id, or it can
  // be a class constructor (like Account) - in that case we
  // extract and return 'name' property from the class constructor.
  private extractPrototypeId(prototype: any)
  {
    let prototypeId = prototype;

    // 'prototype' parameter can either be an entity id (which is a string)
    // of a class constructor (like Account). So if it's not a string,
    // we supposet its a class and we attempt to read it's 'name' property.
    if (!(typeof prototype === 'string' || prototype instanceof String))
    {
      prototypeId = prototype.name;

      if (prototypeId === undefined)
      {
        ERROR("Unable to create entity because 'prototype' parameter"
          + " is neither string nor a class constructor. You need to"
          + " pass either an id of a prototype entity or a class (like"
          + " Account)");
        return null;
      }

      if (!(typeof prototypeId === 'string' || prototypeId instanceof String))
      {
        ERROR("Unable to create entity because 'prototype' parameter"
          + " is not a string and prototype.name is not a string either."
          + " You need to pass either an id of a prototype entity or a class"
          + " (like Account)");
        return null;
      }
    }

    return prototypeId;
  }
}