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