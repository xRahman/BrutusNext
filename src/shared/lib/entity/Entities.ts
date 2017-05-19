/*
  Part of BrutusNEXT

  Stores instances of entities (see class Entity).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {App} from '../../../shared/lib/app/App';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Classes} from '../../../shared/lib/class/Classes';
import {Prototypes} from '../../../shared/lib/entity/Prototypes';
//import {Entity} from '../../../shared/lib/entity/Entity';
import {Entity} from '../../../shared/lib';
import {EntityRecord} from '../../../shared/lib/entity/EntityRecord';
import {EntityProxyHandler} from
  '../../../shared/lib/entity/EntityProxyHandler';

export abstract class Entities
{
  //------------------ Private data ---------------------

  // List of all entities that are loaded in memory.
  // Key:   entity id
  // Value: record containing entity and its proxy handler
  private records = new Map<string, EntityRecord>();

  //----------------- Protected data -------------------- 

  // List of instances of hardcoded entity classes that are
  // used as prototype objects for root prototype entities.
  // Key:   class name
  // Value: instance of the class that is used as prototype object
  protected rootObjects = new Map<string, Entity>();

  // ------------- Public static methods ----------------

  // -> Returns existing reference if entity already exists in Entities.
  //    Returns invalid reference if entity with such 'id' isn't there.
  public static getReference(id: string): Entity
  {
    return App.getEntities().getReference(id);
  }

  // -> Returns 'true' if enity is available.
  public static has(id: string)
  {
    return App.getEntities().has(id);
  }

  // -> Returns 'undefined' if entity isn't found.
  public static get(id: string)
  {
    return App.getEntities().get(id);
  }

  // Removes entity from memory but doesn't delete it from disk
  // (this is used for example when player quits the game).
  // Also removes it from entity lists so it can no longer
  // be searched for.
  public static release(entity: Entity)
  {
    App.getEntities().release(entity);
  }

  // Attempts to create a name lock file.
  // -> Returns 'false' if name change isn't allowed.
  public static async requestName
  (
    id: string,
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    return await App.getEntities().requestName(id, name, cathegory);
  }

  public static async releaseName
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    return await App.getEntities().releaseName(name, cathegory);
  }

  public static async saveEntity(entity: Entity)
  {
    return await App.getEntities().saveEntity(entity);
  }

  // -> Returns 'null' on failure.
  public static async loadEntityById<T extends Entity>
  (
    id: string,
    typeCast: { new (...args: any[]): T }
  )
  : Promise<T>
  {
    let entity = await App.getEntities().loadEntityById(id);

    // Dynamically check that entity is an
    // instance of type T and typecast to it.
    return entity.dynamicCast(typeCast);
  }

  // -> Returns 'null' on failure.
  public static async loadEntityByName<T extends Entity>
  (
    name: string,
    cathegory: Entity.NameCathegory,
    typeCast: { new (...args: any[]): T }
  )
  : Promise<T>
  {
    let entity = await App.getEntities().loadEntityByName
    (
      name,
      cathegory
    );

    // Dynamically check that entity is an
    // instance of type T and typecast to it.
    return entity.dynamicCast(typeCast);
  }

  // ---------------- Public methods --------------------

  // Creates instances of hardcoded classes that are used
  // as prototype objects for root prototypes.
  public createRootObjects()
  {  
    for (let [className, Class] of Classes.entities)
      this.rootObjects.set(className, new Class);
  }

  // --------------- Protected methods ------------------
  
  // -> Returns 'false' if name change isn't allowed.
  protected abstract async requestName
  (
    id: string,
    name: string,
    cathegory: Entity.NameCathegory
  );

  protected abstract async releaseName
  (
    name: string,
    cathegory: Entity.NameCathegory
  );

  /// Tohle teď umí jen ServerEntities.
  /*
  protected abstract generateId(): string;
  */

  protected abstract async saveEntity(entity: Entity);
  protected abstract async loadEntityById(id: string): Promise<Entity>;
  protected abstract async loadEntityByName
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  : Promise<Entity>;

  /// Tohle teď umí jen ServerEntities.
  /*
  protected abstract async createNewEntity
  (
    prototype: Entity,
    name: string,
    cathegory: Entity.NameCathegory,
    isPrototype: boolean
  )
  : Promise<Entity>;
  */

  // -> Returns 'null' if entity instance couldn't be created.
  protected createEntityFromPrototype
  (
    prototype: Entity,
    id: string
  )
  {
    if (!id)
    {
      ERROR("Attempt to create an entity using an invalid id."
        + " Entity is not created");
      return null;
    }

    if (!prototype)
    {
      ERROR("Attempt to create an entity using an invalid"
        + " prototype entity. Entity is not created");
      return null;
    }

    if (!prototype.isPrototypeEntity())
    {
      ERROR("Attempt to use an entity which is not"
        + " a prototype entity as the prototype entity."
        + " Entity is not created");
      return null;
    }

    // Create new bare (unproxified) entity based on the prototype.
    let bareEntity = this.instantiate(prototype);

    if (bareEntity.setId(id) === false)
      return null;

    return this.proxifyAndRegisterEntity(prototype, bareEntity);
  }

  // -> Returns 'null' if prototype object isn't found.
  protected getPrototypeObject(prototypeId: string)
  {
    // First check if 'prototypeId' is a name of a hardcoded class.
    let prototype = this.getRootPrototypeObject(prototypeId);

    if (prototype)
      return prototype;

    // If it's not a class name, it has to be an entity id.
    let prototypeRecord = this.records.get(prototypeId);

    if (prototypeRecord)
      // We use bare (unproxified) entity as a prototype object.
      prototype = prototypeRecord.getEntity();

    if (!prototype)
    {
      ERROR("Unable to create prototype entity because"
        + " prototypeId '" + prototypeId + "' is neither"
        + " an id of an existing prototype entity nor a"
        + " name of hardcoded entity class which doesn't"
        + " have a prototype entity yet");
      return null;
    }

    return prototype;
  }

  // Creates and proxifies entity with specified 'id'.
  // -> Returns 'null' if entity couldn't be created.
  protected createExistingEntity(prototypeId: string, id: string): Entity
  {
    let prototype = this.getPrototypeObject(prototypeId);

    if (!prototype)
      return null;

    return this.createEntityFromPrototype(prototype, id);
  }

  /// Tohle teď umí jen ServerEntities.
  /*
  // -> Returns 'null' on error.
  protected abstract async createPrototype
  (
    prototypeId: string,
    prototypeName: string,
    name: string
  )
  : Promise<Entity>;
  */

  // -> Returns 'true' if enity is available.
  protected has(id: string)
  {
    return this.records.has(id);
  }

  // -> Returns 'undefined' if entity isn't found.
  protected get(id: string)
  {
    let entityRecord = this.records.get(id)

    if (!entityRecord)
      return undefined;

    return entityRecord.getEntity();
  }

  // -> Returns added entity or 'null' on failure.
  protected add(entityRecord: EntityRecord)
  {
    let id = entityRecord.getEntity().getId();
    let existingRecord = this.records.get(id);

    if (existingRecord !== undefined)
    {
      ERROR("Attempt to add entity "
       + entityRecord.getEntity().getErrorIdString()
       + " to Entities which already exists there."
       + " Entity is not added, existing one will be used");
      return existingRecord.getEntity();
    }

    // Add entity record to hashmap under entity's id.
    this.records.set(id, entityRecord);

    return entityRecord.getEntity();
  }

  // Removes entity from memory but doesn't delete it from disk
  // (this is used for example when player quits the game).
  //   Also removes entity from entity lists so it can no
  // longer be searched for.
  protected release(entity: Entity)
  {
    if (!Entity.isValid(entity))
    {
      ERROR("Attempt to remove invalid entity from Entities");
      return;
    }

    // Remove entity from entity lists so it can no longer be searched for.
    entity.removeFromLists();

    let entityRecord = this.records.get(entity.getId());

    if (!entityRecord)
    {
      ERROR("Attempt to remove entity " + entity.getErrorIdString()
        + " from Entities which is not there");
      return;
    }

    // Remove the record from hashmap.
    this.records.delete(entity.getId());

    // Invalidate internal 'entity' reference in proxy handler
    // so the entity can be freed from memory by garbage collector.
    // (any future access to entity's properties will be reported
    //  by it's proxy handler as error).
    entityRecord.invalidate();
  }

    // -> Returns 'null' if 'prototypeId doesn't identify a root
  //    prototype object or if such root prototye entity already
  //    exists.
  protected getRootPrototypeObject(className: string)
  {
    // Check if 'prototypeId' is a className of hardcoded entity class.
    let prototype = this.rootObjects.get(className);

    if (!prototype)
      return null

    if (Prototypes.get(className))
    {
      ERROR("Attempt to create root prototype entity which"
        + " already exists. Entities with 'className' as"
        + " prototypeId can only be created once");
      return null;
    }

    return prototype;
  }

  // ---------------- Private methods -------------------

  // Creates a new bare entity with 'prototype' as it's prototype object.
  // -> Returns 'null' on error.
  private instantiate(prototype: Entity)
  {
    if (prototype === null || prototype === undefined)
    {
      ERROR("Attempt to create a prototype instance based on an"
        + " invalid prototype object. Instance is not created");
      return null;
    }

    // Object.create() will create a new object with 'prototype'
    // as it's prototype object. This will ensure that all 'own'
    // properties of 'prorotype' (those initialized in constructor
    // or in class body of prototype) become 'inherited' properties
    // on the new instance (so that changing the value on prototype
    // will change the value for all instances that don't have that
    // property overriden).
    let bareEntity: Entity = Object.create(prototype);

    // Prototype inheritance in Javascript handles nonprimitive
    // properties as direct references to such properties in
    // prototype object. That means that writing to a property
    // inside a nonprimitive property changes the value on the
    // prototype, not on the instance. To prevent this, we need
    // to manually instantiate all nonprimitive properties.
    this.instantiateProperties(bareEntity, prototype);

    return bareEntity;
  }

  // Ensures that all non-primitive properties of 'prototype'
  // are instantiated on 'object'.
  // -> Returns 'object' with instantiated properties.
  private instantiateProperties(object: Object, prototype: Object)
  {
    if (object === null || object === undefined)
      return null;

    for (let propertyName in object)
      this.instantiateProperty(object, prototype, propertyName);

    return object;
  }

  // Ensures that if 'property' of 'object' is non-primitive,
  // it is recursively instantiated as an empty Object inherited
  // from the respective 'property' on 'prototype' object.
  private instantiateProperty
  (
    object: Object,
    prototype: Object,
    propertyName: string
  )
  {
    if (prototype === undefined || prototype === null)
    {
      ERROR("Invalid prototype object");
      return;
    }

    // There is no point of instantating properties that don't exist
    // on prototype object or have 'null' value on it.
    if (prototype[propertyName] === undefined
        || prototype[propertyName] === null)
      return;

    // Primitive properties (numbers, strings, etc) don't have to
    // be instantiated because Javascript prototype inheritance
    // handles them correctly.
    if (typeof object[propertyName] !== 'object')
      return;

    // This check allows re-instantiating of properties of existing
    // instance when prototype is changed. Properties that already
    // are instantiated (they are 'own' properties of object) are
    // not overwritten.
    if (!object.hasOwnProperty(propertyName))
      // Object.create() will create a new {}, which will have
      // prototype[propertyName] as it's prototype object.
      object[propertyName] = Object.create(prototype[propertyName]);

    // Property we have just instantiated may have it's own
    // non-primitive properties that also need to be instantiated.
    //   Note that recursive call is done even for properties that
    // have already been instantiated on 'object', because there
    // still may be some changes deeper in the structure).
    this.instantiateProperties(object[propertyName], prototype[propertyName]);
  }

  // -> Returns registered and proxified entity,
  //   'null' if entity couldn't be registered or proxified.
  private proxifyAndRegisterEntity(prototype: Entity, bareEntity: Entity)
  {
    let handler = this.createProxyHandler(bareEntity);

    // Hide bare entity behind a Proxy object which will report
    // access to the entity's properties if it becomes invalid.
    let proxy = this.createEntityProxy(handler);

    // Create an new EntityRecord that will be added to Entities.
    let entityRecord = new EntityRecord(proxy, handler);

    // Add entity record to Entities. If a record with this 'id'
    // already exists, the existing one will be used instead of
    // the one we have just created.
    //   In case of error entity will be 'null'.
    return this.add(entityRecord);
  }

  // Creates a Javascript Proxy Object that will trap access
  // of entity properties (using EntityProxyHandler we have
  // just created) and report en error if it becomes invalid.
  // -> Returns entity proxy.
  private createEntityProxy(handler: EntityProxyHandler)
  {
    return new Proxy({}, handler);
  }

  // -> Returns EntityProxyHandler for 'bareEntity'.
  private createProxyHandler(bareEntity: Entity)
  {
    let handler = new EntityProxyHandler();

    handler.id = bareEntity.getId();
    handler.entity = bareEntity;

    return handler;
  }

  // -> Returns existing reference if entity already exists in Entities.
  //    Returns invalid reference if entity with such 'id' isn't there.
  private getReference(id: string): Entity
  {
    let entity = this.get(id);
    
    if (entity)
      return entity;

    return this.createInvalidEntity(id);
  }

  // Creates an invalid entity. Access to this entity's properties
  // will be reported as error.
  // (This is used when an entity that is being deserialized has
  //  a reference to an entity that doesn't exist at the moment.)
  private createInvalidEntity(id: string)
  {
    let handler = new EntityProxyHandler();

    handler.id = id;
    // We are purposely creating an invalid reference so the internal
    // entity reference shall be 'null'.
    handler.entity = null;

    // Create a Javascript Proxy Object that will report access
    // of entity properties.
    return new Proxy({}, handler);
  }
}



/// To be deleted.
/*
export abstract class Entities
{
  // ------------- Public static methods ----------------

  public static createRootEntity<T extends Entity>
  (
    className: string,
    Class: { new (...args: any[]): T }
  )
  {
    App.getEntityManager().createRootEntity(className, Class);
  }

  /// Dynamic typecasting asi není potřeba u createExistingEntity(),
  /// protože se volá jen v Serializable.createEntityInstance() při
  /// deserializaci. Kdyby to přestalo platit, v commentu je typecastová
  /// verze.
  // Creates entity using an existing 'id'.
  // -> Returns 'null' if entity couldn't be created.
  public static createExistingEntity<T extends Entity>
  (
    prototypeId: string,
    id: string,
    typeCast: { new (...args: any[]): T }
  )
  : T
  {
    let entity = App.getEntityManager().createExistingEntity(prototypeId, id);

    // Dynamically check that entity is an
    // instance of type T and typecast to it.
    return entity.dynamicCast(typeCast);
  }

  // ---------------- Private methods -------------------

  private createRootEntity<T extends Entity>
  (
    className: string,
    Class: { new (...args: any[]): T }
  )
  {
    // 'className' will be used as an entity id.
    if (this.has(className))
    {
      ERROR("Attempt to add root prototype entity for class " + className
        + " to Entities which is already there");
      return;
    }

    // Unlike all other entities which are created using Object.create(),
    // root entities are created as 'new Class'
    // (We don't need Object.create() because root entities are only used
    //  as prototype objects for root prototypes).
    let instance = new Class();

    // Set 'className' as 'id'
    // (root entities use 'className' as their entity id in order for this
    //  id to be the same both on the client and on the server. This way
    //  when a prototype chain is recreated after an entity is serialized,
    //  sent to client and deserialized back, client knows what a root
    //  prototype object of that chain is).
    if (instance.setId(className) === false)
      return;

    let handler = this.createProxyHandler(instance);

    // Hide bare entity behind a Proxy object which will report
    // access to it's properties if it becomes invalid.
    // (We don't really need proxies for root entities because they
    //  are only used as prototype objects, but by doing it we can
    //  handle them using the same code as any other entities.)
    let proxy = this.createEntityProxy(handler);

    // Create an new EntityRecord that will be added to Entities.
    let entityRecord = new EntityRecord(proxy, handler);

    // Add root entity to Entities
    //   Note that in case of root entity, there is no point in
    // setting it's prototype - root entities don't have any.
    this.add(entityRecord);
  }

    // // Loads uniquely named entity from file
  // // (it must not exist in Entities). 
  // // -> Returns reference to the loaded entity.
  // public async loadNamedEntity
  // (
  //   name: string,
  //   cathegory: NamedEntity.NameCathegory,
  // )
  // {
  //   // In order to load any entity, we need to know it's id.
  //   // Uniquelly named entities have their id saved in special
  //   // file on disk, so we need to load id from this file first.
  //   let id = await this.loadNamedEntityId(name, cathegory);

  //   if (id === null || id === undefined)
  //     // Error is already reported by loadNamedEntityId()
  //     return null;

  //   return await this.loadEntity(id);
  // }

  // // Creates entity, loads it from file and adds it to the manager
  // // (entity must not exist in the manager before loading).
  // // -> Returns 'null' if loading fails.
  // public async loadEntity(id: string)
  // {
  //   // First check if such entity already exists in Entities
  //   // (get() returns 'undefined' if entity is not found).
  //   let entity = this.get(id, Entity);

  //   // If it does, there is no point in loading it - any unsaved changes
  //   // would be lost.
  //   if (entity !== undefined)
  //   {
  //     this.reportEntityExists(entity);
  //     return entity;
  //   }

  //   entity = await this.createAndLoadEntity(id);

  //   // Create a proxy object for 'entity' and add it to the manager.
  //   return this.addEntityAsProxy(entity);
  // }

  // // Creates a new entity without setting a name to it
  // // (use this to create Connections and other entities
  // //  that are not inherited from NamedEntity).
  // public async createEntity<T extends Entity>
  // (
  //   Class: { new (...args: any[]): T },
  //   // If 'prototypeId' is 'null', 'Class.name'
  //   // will be used to identify prototype entity.
  //   prototypeId: string = null
  // )
  // : Promise<T>
  // {
  //    let entity = await this.createEntityInstance(null, Class, prototypeId);

  //   // Dynamic cast means runtime check that 'entity' really is inherited
  //   // from the type we are casting to. It also changes the type of return
  //   // value to the type of 'Class' parameter. It means that typescript
  //   // will allow you to access properties of that type on returned 'entity'. 
  //   return entity.dynamicCast(Class);
  // }

  // // Creates a new entity with non-unique name.
  // public async createNamedEntity<T extends Entity>
  // (
  //   name: string,
  //   Class: { new (...args: any[]): T },
  //   // If 'prototypeId' is 'null', 'Class.name'
  //   // will be used to identify prototype entity.
  //   prototypeId: string = null
  // )
  // : Promise<T>
  // {
  //   let entity = await this.createEntityInstance(name, Class, prototypeId);

  //   // We can safely use setNameSync(), because we have just created
  //   // a new entity so we can be sure that it doesn't unique name
  //   // (it means that there definitely isn't any name lock file
  //   //  asociated with it which would have to be deleted from disk,
  //   //  which would be an asyncronous operation).
  //   entity.setNameSync(name);

  //   // Dynamic cast means runtime check that 'entity' really is inherited
  //   // from the type we are casting to. IT also changes the type of return
  //   // value to the type of 'typeCast' parameter. It means that typescript
  //   // will allow you to access properties of that type on returned 'entity'. 
  //   return entity.dynamicCast(Class);
  // }

  // // Creates a new entity with unique name.
  // public async createUniqueEntity<T extends Entity>
  // (
  //   name: string,
  //   // Either a prototype entity id, or a class (like Account).
  //   Class: { new (...args: any[]): T },
  //   // If 'cathegory' is 'null', the name won't be unique.
  //   cathegory: NamedEntity.NameCathegory = null,
  //   // If 'prototypeId' is 'null', 'typeCast' will be used as prototype.
  //   prototypeId: string = null
  // )
  // : Promise<T>
  // {
  //   let entity = await this.createEntityInstance(name, Class, prototypeId);

  //   // Unique name is represented by respective name lock file and
  //   // creating such file is an async operation, so we need to use
  //   // asynchronnous call. 
  //   await entity.setName(name, cathegory);

  //   // Dynamic cast means runtime check that 'entity' really is inherited
  //   // from the type we are casting to. IT also changes the type of return
  //   // value to the type of 'typeCast' parameter. It means that typescript
  //   // will allow you to access properties of that type on returned 'entity'. 
  //   return entity.dynamicCast(Class);
  // }

  // // Removes entity from manager but doesn't delete it from disk
  // // (this is used for example when player quits the game).
  // // Also removes entity from entity lists so it can no longer
  // // be searched for.
  // public remove(entity: Entity)
  // {
  //   if (entity === null || entity === undefined)
  //   {
  //     ERROR("Attempt to remove 'null' or 'undefined'"
  //       + " entity from Entities");
  //     return;
  //   }

  //   // Remove entity from entity lists so it can no longer be searched for.
  //   entity.removeFromLists();

  //   // get() returns undefined if there is no such record in hashmap.
  //   let entityRecord = this.entityRecords.get(entity.getId());

  //   if (entityRecord === undefined)
  //   {
  //     ERROR("Attempt to remove entity " + entity.getErrorIdString()
  //       + " from Entities which is not present in the manager");
  //     return;
  //   }

  //   // Remove a record from hashmap (so when anyone ask for this
  //   // entity using it's string id, he will get undefined).
  //   if (this.entityRecords.delete(entity.getId()) === false)
  //   {
  //     ERROR("Failed to delete record '" + entity.getId() + "' from"
  //       + " Entities");
  //   }

  //   // IMPORTANT: This must be done after deleting a record from
  //   // Entities, because entity is actualy a proxy and accessing
  //   // 'getId' property on it would lead to updateReference() call,
  //   // which would fail, because entity reference in proxyhandler would
  //   // already by null but entityRecord would still be present in
  //   // Entities.

  //   // Set all proxy handlers of this entity to null (so anyone who
  //   // still has a reference to entity proxy will know that entity is
  //   // no longer valid).
  //   entityRecord.invalidate();
  // }

  // // -> Returns entity proxy matching given id.
  // //    Returns 'undefined' if entity doesn't exist in Entities.
  // public get<T>
  // (
  //   id: string,
  //   typeCast: { new (...args: any[]): T }
  // )
  // : T
  // {
  //   // This check is done first so we save ourself searching a 'null'
  //   // record in hashmap.
  //   if (id === null || id === undefined || id === "")
  //   {
  //     ERROR("Invalid id");
  //     return undefined;
  //   }

  //   let entityRecord: EntityRecord = this.entityRecords.get(id);
    
  //   if (entityRecord === undefined)
  //     return undefined;

  //   // Now we know that the record for the entity with this 'id' exists
  //   // in hashmap, so we will return it's existing proxy. But let's do
  //   // some sanity checks first.

  //   let entityProxy = entityRecord.getEntityProxy();

  //   if (entityProxy === undefined || entityProxy === null)
  //   {
  //     ERROR("Invalid entity proxy in entity record of"
  //       + " entity with id " + id);
  //   }

  //   return entityProxy.dynamicCast(typeCast);
  // }

  // // Check if entity exists in Entities.
  // public has(id: string): boolean
  // {
  //   return this.entityRecords.has(id);
  // }

  // // Creates a new entity based on prototype 'new Class'
  // // (this is used to create prototype entities for hardcoded
  // //  entity classes like Account).
  // // -> Returns 'null' if prototype entity couldn't be created.
  // public createHardcodedPrototypeEntity
  // (
  //   prototypeObject: Entity,
  //   className: string
  // )
  // {
  //   let entity = this.createEntityFromPrototype(prototypeObject);

  //   return this.initPrototypeEnitityName(entity, className);
  // }

  // public composePrototypeEntity
  // (
  //   prototypeObject: Entity,
  //   className: string,
  //   id: string,
  //   descendantIds: Set<string>
  // )
  // {
  //   let entity = this.composeEntityFromPrototype(prototypeObject, id);

  //   entity.descendatIds = descendantIds;

  //   return this.initPrototypeEnitityName(entity, className);
  // }

  // --------------- Private methods -------------------

  // // Adds entity proxy to the manager.
  // private addProxy(proxy: Entity, handler: EntityProxyHandler)
  // {
  //   let entity = handler.entity;

  //   if (entity === null)
  //   {
  //     ERROR("Attempt to add <null> entity to Entities. That is not"
  //       + " allowed. There may only be existing entity instances in the"
  //       + " manager. Record is not added");
  //     return;
  //   }

  //   let entityRecord = new EntityRecord(proxy, handler);

  //   if (this.entityRecords.get(handler.id))
  //   {
  //     ERROR("Attempt to add entity " + proxy.getErrorIdString()
  //       + " to Entities which is already present in it."
  //       + " entity is not added");
  //     return;
  //   }

  //   // Add newly created entity record to hashmap under entity's string id.
  //   this.entityRecords.set(handler.id, entityRecord);
  // }

  // // Loads entity id from file corresponding to unique entity
  // // name and it's unique names cathegory.
  // // -> Returns id loaded from file or 'null' in case of failure.
  // private async loadNamedEntityId
  // (
  //   name: string,
  //   cathegory: NamedEntity.NameCathegory
  // )
  // {
  //   // File path is something like './data/names/accounts/Rahman.json'.
  //   let path = NamedEntity.getNameLockFilePath(name, cathegory);

  //   let idRecord = new NameLockRecord();

  //   await idRecord.loadFromFile(path);

  //   if (idRecord.id === null || idRecord.id === undefined)
  //   {
  //     ERROR("Failed to load id from file " + path);
  //     return null;
  //   }

  //   return idRecord.id;
  // }

  // /// TODO: Místo tohohle použít JsonObject.getPrototypeId()
  // // -> Returns prototype id read from 'jsonObject', 'null' if it's not there. 
  // private getPrototypeIdFromJsonObject
  // (
  //   jsonObject: Object,
  //   // 'path' is passed just to make error messages more informative.
  //   path: string
  // )
  // {
  //   TODO
  //   if (jsonObject === null || jsonObject === undefined)
  //   {
  //     ERROR("Invalid json object loaded from file"
  //       + " " + path + " Entity is not loaded");
  //     return null;
  //   }

  //   let prototypeId = jsonObject[Entity.PROTOTYPE_ID_PROPERTY]; 

  //   if (prototypeId === undefined || prototypeId === null)
  //   {
  //     ERROR("Missing or uninitialized property 'prototypeId' in file"
  //       + " " + path + ". Entity is not loaded");
  //     return null;
  //   }

  //   return prototypeId;
  // }

  // // -> Returns entity name read from 'jsonObject', 'null' if it's not there. 
  // private getNameFromJsonObject
  // (
  //   jsonObject: Object,
  //   // 'path' is passed just to make error messages more informative.
  //   path: string
  // )
  // {
  //   if (jsonObject === null || jsonObject === undefined)
  //   {
  //     ERROR("Invalid json object loaded from file " + path);
  //     return null;
  //   }

  //   let name = jsonObject[NamedEntity.NAME_PROPERTY]; 

  //   if (name === undefined)
  //     // This is not an error, some entities don't have a name.
  //     return null;

  //   return name;
  // }

  // // Creates an instance of an entity, loads it from 'jsonObject'
  // // and sets 'entityId' to it. Doesn't create a proxy object.
  // // Doesn't add the entity to the manager.
  // // -> Returns loaded entity (not a proxy) or 'null' on load failure. 
  // private async loadEntityFromJsonObject
  // (
  //   jsonObject: Object,
  //   id: string,
  //   // 'path' is passed just to make error messages more informative.
  //   path: string
  // )
  // : Promise<Entity>
  // {
  //   let prototypeId = this.getPrototypeIdFromJsonObject(jsonObject, path);

  //   if (prototypeId === null)
  //     // Error is already reported by readPrototypeIdFromJsonObject().
  //     return null;

  //   // Entity name is not really needed but it makes error messages
  //   // more informative. If saved entity doesn't have a name, 'null'
  //   // will be returned.
  //   let entityName = this.getNameFromJsonObject(jsonObject, path)

  //   let prototypeEntity = await this.getPrototypeEntity
  //   (
  //     entityName,
  //     // Entities loaded from file must reference their prototype by
  //     // 'prototypeId', never by prototype name. So we don't provide
  //     // 'className' even though we could read it from JsonObject, because
  //     // it could lead to incorrect behaviour.
  //     null,
  //     prototypeId
  //   );

  //   let entity = Server.prototypeManager.createInstance(prototypeEntity);

  //   // And let it load itself from jsonObject.
  //   // ('path' is passed just to make error messages more informative)
  //   if (!entity.loadFromJsonObject(jsonObject, path))
  //     return null;

  //   // Also update entity's id.
  //   // (it is not saved to file, because id is used as file
  //   //  name so there would be unnecessary duplicity).
  //   entity.setId(id);

  //   return entity;
  // }

  // private reportEntityExists(entity: Entity)
  // {
  //   ERROR("It is not possible to load entity"
  //     + " " + entity.getErrorIdString() + " because it"
  //     + " is already loaded in Entities. All unsaved"
  //     + " changes would be lost. If you really need to lose"
  //     + " unsaved changes on this entity, remove() it from"
  //     + " Entities and then call Entities.loadEntity()."
  //     + " Entity is not loaded");
  // }

  // // Creates a new entity based on 'prototypeObject', sets 'id' to it,
  // // encapsulates the result in a javascript proxy object to trap access
  // // to invalid entity and adds the proxy to the manager.
  // // -> Returns the proxy that is used instead of the entity.
  // private composeEntityFromPrototype(prototypeEntity: Entity, id: string)
  // {
  //   // Note that entity is not really an instance in the sense of
  //   // 'new Class', but rather an empty object with prototypeObject
  //   // set as it's prototype using Object.create(). It's non-primitive
  //   // properties are also instantiated like this. This way, any property
  //   // not set to entity after it's creation is actually read from the
  //   // prototypeObject, which means that if you edit a prototype,
  //   // changes will propagate to all entities instantiated from it,
  //   // which don't have that property overriden. 
  //   let entity = Server.prototypeManager.createInstance(prototypeEntity);

  //   if (entity['setId'] === undefined)
  //   {
  //     ERROR("Attempt to create entity '" + name + "' from prototype which"
  //       + " is not an instance of Entity class or it's descendants");
  //     return null;
  //   }

  //   entity.setId(id);

  //   // Create an entity proxy and add it to the manager.
  //   return this.addEntityAsProxy(entity);
  // }

  // // Creates a new entity based on 'prototypeObject', encapsulates
  // // the result in a javascript proxy object to trap access to invalid
  // // entity and adds the proxy to the manager.
  // // -> Returns the proxy that is used instead of the entity.
  // private createEntityFromPrototype(prototypeEntity: Entity)
  // {
  //   // Generate an id for this new entity.
  //   let id = this.idProvider.generateId();

  //   return this.composeEntityFromPrototype(prototypeEntity, id);
  // }

  // // Creates an entity proxy handler for 'entity', than
  // // adds the proxy to the manager.
  // // -> Returns the proxy that should be used to access the entity.
  // private addEntityAsProxy(entity: Entity)
  // {
  //   if (entity === null || entity === undefined)
  //   {
  //     ERROR("Invalid value of parameter 'entity'");
  //     return null;
  //   }

  //   let handler = new EntityProxyHandler();

  //   handler.id = entity.getId();
  //   handler.entity = entity;

  //   // Create a Javascript Proxy Object that will trap access
  //   // of entity properties (using EntityProxyHandler we have
  //   // just created) and report en error if an invalid (deleted)
  //   // entity is accessed.
  //   let proxy = new Proxy({}, handler);

  //   // Add the proxy to the manager.
  //   this.addProxy(proxy, handler);

  //   return proxy;
  // }

  // // -> Returns 'null' if loading fails.
  // private async createAndLoadEntity(id: string)
  // {
  //   let path = Entity.getSavePath(id);

  //   // We need to load contents of save file to JSON object first,
  //   // so we can read prototype id from it.
  //   let jsonObject = await SaveableObject.loadJsonObjectFromFile(path);

  //   if (jsonObject === null)
  //     // Error is already reported by SaveableObject.loadJsonObjectFromFile().
  //     return null;

  //   // Read prototype id from 'jsonObject', create a new entity
  //   // based on that prototype and load it from jsonObject.
  //   return await this.loadEntityFromJsonObject(jsonObject, id, path);
  // }

  // // This auxiliary function handles parameter overloading.
  // // 'prototype' can either be a string entity id, or it can
  // // be a class constructor (like Account) - in that case we
  // // extract and return 'name' property from the class constructor.
  // private extractPrototypeId(prototype: any)
  // {
  //   let prototypeId = prototype;

  //   // 'prototype' parameter can either be an entity id (which is a string)
  //   // of a class constructor (like Account). So if it's not a string,
  //   // we supposet its a class and we attempt to read it's 'name' property.
  //   if (!(typeof prototype === 'string' || prototype instanceof String))
  //   {
  //     prototypeId = prototype.name;

  //     if (prototypeId === undefined)
  //     {
  //       ERROR("Unable to create entity because 'prototype' parameter"
  //         + " is neither string nor a class constructor. You need to"
  //         + " pass either an id of a prototype entity or a class (like"
  //         + " Account)");
  //       return null;
  //     }

  //     if (!(typeof prototypeId === 'string' || prototypeId instanceof String))
  //     {
  //       ERROR("Unable to create entity because 'prototype' parameter"
  //         + " is not a string and prototype.name is not a string either."
  //         + " You need to pass either an id of a prototype entity or a class"
  //         + " (like Account)");
  //       return null;
  //     }
  //   }

  //   return prototypeId;
  // }

  // // If 'entity' is a NamedEntity, set an informative name
  // // to it (something like 'Account prototype').
  // private initPrototypeEnitityName
  // (
  //   entity: NamedEntity,
  //   className: string
  // )
  // {
  //   // Not all entities have names - for example Connection doesn't.
  //   if (entity.setNameSync !== undefined)
  //   {
  //     // Something like 'Account prototype'.
  //     let name = className + ' prototype';

  //     // We can safely use setNameSync(), because we have just created
  //     // a new entity so we can be sure that it doesn't unique name
  //     // (it means that there definitely isn't any name lock file
  //     //  asociated with it which would have to be deleted from disk,
  //     //  which would be an asyncronous operation).
  //     entity.setNameSync(name);
  //   }

  //   return entity;
  // }

  // private reportMissingPrototypeEntity
  // (
  //   entityName: string,
  //   className: string,
  //   prototypeId: string
  // )
  // {
  //   let prototypeName = prototypeId;

  //   if (prototypeId === null)
  //     prototypeName === className;

  //   if (entityName !== null)
  //   {
  //     ERROR("Unable to create entity" + entityName + " based"
  //       + " on prototype '" + prototypeName + "': prototype"
  //       + " entity doesn't exist");
  //   }
  //   else
  //   {
  //     ERROR("Unable to create entity based on prototype"
  //       + " '" + prototypeName + "': prototype entity"
  //       + " doesn't exist");
  //   }
  // }

  // // Searches for prototype entity in Prototypes using
  // // prototype class name.
  // // -> Returns 'undefined' if prototype entity isn't found.
  // private getPrototypeEntityByClassName(className: string): Entity
  // {
  //   if (className === null || className === undefined)
  //   {
  //     ERROR("Invalid 'className'");
  //     return undefined;
  //   }

  //   let prototypeEntity =
  //     Server.prototypeManager.getPrototypeObject(className);

  //   // Dynamic type check - we make sure that
  //   // entity is inherited from Entity class.
  //   if (!(prototypeEntity instanceof Entity))
  //   {
  //     ERROR("Requested prototype object '" + className + "'"
  //       + " is not an Entity");
  //     return undefined;
  //   }

  //   return <Entity>prototypeEntity;
  // }

  // // -> Returns 'null' if such prototype entity doesn't exist.
  // private async getPrototypeEntityById(prototypeId: string)
  // {
  //   // get() returns 'undefined' if id is not present in Entities.
  //   let entity = this.get(prototypeId, Entity);

  //   if (entity !== undefined)
  //     return entity;

  //   // If prototype entity isn't in the Manager, we will try to load
  //   // it from the disk.
  //   return await this.loadEntity(prototypeId);
  // }

  // // Searches for prototype entity in Entities if 'prototypeId'
  // // isn't null, or in Prototypes using 'className' otherwise.
  // // -> Returns 'undefined' if prototype entity isn't found.
  // private async getPrototypeEntity
  // (
  //   // 'entityName' is only used in error messages.
  //   // Pass 'null' if you don't know the name.
  //   entityName: string,
  //   className: string,
  //   // If 'prototypeId' is 'null', 'className'
  //   // will be used to identify prototype entity.
  //   prototypeId: string = null
  // )
  // : Promise<Entity>
  // {
  //   let proxy = null;

  //   if (prototypeId !== null)
  //   {
  //     // If 'prototypeId' is provided, we will search for prototype
  //     // entity using this id.
  //     proxy = await this.getPrototypeEntityById(prototypeId);      
  //   }
  //   else
  //   {
  //     // Otherwise we will search for prototype entity in
  //     // Prototypes using class name.
  //     proxy = this.getPrototypeEntityByClassName(className);
  //   }

  //   if (proxy === undefined)
  //     this.reportMissingPrototypeEntity(entityName, className, prototypeId);

  //   // Using entity proxy as a prototype object wouldn't be a good idea.
  //   //   First of all, it breaks inheritance - setting entity.property
  //   // sets the property to the proxified prototype rather than to the
  //   // instance (that might be fixed however).
  //   //   Secondly, it would unnecessarily slow things down. The resulting
  //   // entity instance will be proxified anyways so access to invalid entity
  //   // will get trapped regardless on whether the prototype entity will be
  //   // proxified. And prototype entities should never be deleted (and thus
  //   // invalidated) anyways - at least not as long as there are any instances
  //   // based on them left.
  //   let entity = proxy['_internalEntity'];

  //   if (entity === null || entity === undefined)
  //   {
  //     ERROR("Attempt to use invalid entity " + proxy.getErrorIdString()
  //       + " as a prototype entity");
  //     return null;
  //   }

  //   return entity;
  // }

  // // -> Returns 'null' if entity instance couldn't be created.
  // private async createEntityInstance<T extends Entity>
  // (
  //   entityName: string,
  //   Class: { new (...args: any[]): T },
  //   prototypeId: string = null
  // )
  // {
  //   // getPrototypeEntity() returns 'undefined' if prototype entity
  //   // cannot be found.
  //   let prototypeEntity = await this.getPrototypeEntity
  //   (
  //     entityName,
  //     Class.name,
  //     prototypeId
  //   );

  //   if (prototypeEntity === undefined)
  //     // Error is already reported by getPrototypeEntity().
  //     return null;

  //   let entity = this.createEntityFromPrototype(prototypeEntity);

  //   entity.setPrototypeId(prototypeEntity.getId());

  //   return entity;
  // }

  //   // -> Returns 'true' if prototype 'className' doesn't exist yet.
  // //    Returns 'false' and reports error if it already exists.
  // private isPrototypeNameAvailable(className: string): boolean
  // {
  //   // Check if requested 'prototypeName' is available.
  //   let test = Server.prototypeManager.getPrototypeObject(className);

  //   if (test !== undefined)
  //   {
  //     ERROR("Unable to create new prototype '" + className + "'"
  //       + " because it already exists");
  //     return false;
  //   }

  //   return true;
  // }
}
*/