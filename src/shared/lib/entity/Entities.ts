/*
  Part of BrutusNEXT

  Stores instances of entities (see class Entity).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {App} from '../../../shared/lib/app/App';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Classes} from '../../../shared/lib/class/Classes';
import {Prototypes} from '../../../shared/lib/entity/Prototypes';
import {Entity} from '../../../shared/lib/entity/Entity';

/// Experiment s Proxy pro property typu Date, Set, Map, atd.
/// - nefunguje, date.toJSON() pořád vyhazuje výjimku
///    'Method Date.prototype.valueOf called on incompatible
///     receiver [object Object]'
///   Což znamená, že valueOf() má pořád špatně 'this' (objekt
///   vyrobený pomocí Object.create() místo jedné ze dvou interních
///   hodnot proxy handleru)...
/*
class PropertyProxyHandler
{
  private static setters = new Set
  (
    [
      // Setters of 'Date' class.
      'setDate',
      'setFullYear',
      'setHours',
      'setMilliseconds',
      'setMinutes',
      'setMonth',
      'setSeconds',
      'setTime',
      'setUTCDate',
      'setUTCFullYear',
      'setUTCHours',
      'setUTCMilliseconds',
      'setUTCMinutes',
      'setUTCMonth',
      'setUTCSeconds',
      'setYear'
    ]
  );

  // Proxified instantiated property always contain
  // a new 'own' value, but it is not accessed unless
  // someone tries to write to it using a setter method.
  private isOwnProperty = false;

  constructor(private prototypeValue, private ownValue) {}

  // A trap for getting property values.
  public get(target: any, property: any): any
  {
    if (this.isOwnProperty)
      return Reflect.get(this.ownValue, property);

    // Accessing a setter will flip 'isOwnProperty' flag
    // so that 'own' value is accessed from now on.
    // (We suppose that if anyone 'gets' a setter method,
    //  he will also use it to set a value to this property.)
    if (PropertyProxyHandler.setters.has(property))
    {
      this.isOwnProperty = true;

      // And we return the setter of the 'ownValue' so
      // it will be modified instead of prototype.
      return Reflect.get(this.ownValue, property);
    }

    // If a non-setter property is accessed and we are
    // not yet flagged as 'own' property, prototype
    // value is read.
    return Reflect.get(this.prototypeValue, property);
  }

  public apply(target, thisArg, argumentsList)
  {
    if (this.isOwnProperty)
      return Reflect.apply(target, this.ownValue, argumentsList);
    else
      return Reflect.apply(target, this.prototypeValue, argumentsList);
  }
}
*/

export abstract class Entities
{
  //------------------ Private data ---------------------

  // List of all entities that are loaded in memory.
  // Key:   entity id
  // Value: entity
  private entityList = new Map<string, Entity>();

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
    let entity = App.entities.entityList.get(id);
    
    if (entity)
      return entity;

    return this.createInvalidReference(id);
  }

  // -> Returns 'true' if enity is available.
  public static has(id: string)
  {
    return App.entities.entityList.has(id);
  }

  // -> Returns 'undefined' if entity isn't found.
  public static get(id: string)
  {
    return App.entities.entityList.get(id);
  }

  // Removes entity from memory but doesn't delete it from disk
  // (this is used for example when player quits the game).
  // Also removes it from entity lists so it can no longer
  // be searched for.
  public static release(entity: Entity)
  {
    if (!Entity.isValid(entity))
    {
      ERROR("Attempt to remove invalid entity from Entities");
      return;
    }

    // Remove entity from entity lists so it can no longer be searched for.
    entity.removeFromLists();

    // Remove the record from hashmap.
    if (!App.entities.entityList.delete(entity.getId()))
    {
      ERROR("Attempt to remove entity " + entity.getErrorIdString()
        + " from Entities which is not there");
    }

    // Recursively delete all properties and set the prototype to 'null.
    // This way if anyone has a reference to this entity and tries to use
    // it, it will throw an exception (so we will know that someone tries
    // to use a deleted entity).
    entity.invalidate();
  }

  public static async save(entity: Entity)
  {
    return await App.entities.saveEntity(entity);
  }

  // -> Returns 'null' on failure.
  public static async loadEntityById<T extends Entity>
  (
    id: string,
    typeCast: { new (...args: any[]): T }
  )
  : Promise<T>
  {
    let entity = await App.entities.loadEntityById(id);

    if (!entity)
    {
      ERROR("Failed to load entity id: " + id);
      return null;
    }

    // Dynamically check that entity is an
    // instance of type T and typecast to it.
    return entity.dynamicCast(typeCast);
  }

  // -> Returns 'null' on failure.
  public static async loadEntityByName<T extends Entity>
  (
    typeCast: { new (...args: any[]): T },
    name: string,
    cathegory: Entity.NameCathegory
  )
  : Promise<T>
  {
    let entity = await App.entities.loadEntityByName
    (
      name,
      cathegory
    );

    if (!entity)
    {
      ERROR("Failed to load entity '" + name + "' in cathegory"
        + " '" + Entity.NameCathegory[cathegory] + "'");
      return null;
    }

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

  protected abstract async saveEntity(entity: Entity);
  protected abstract async loadEntityById(id: string): Promise<Entity>;
  protected abstract async loadEntityByName
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  : Promise<Entity>;

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
        + " prototype. Entity is not created");
      return null;
    }

    if (!prototype.isPrototypeEntity())
    {
      ERROR("Attempt to use an entity which is not"
        + " a prototype entity as the prototype entity."
        + " Entity is not created");
      return null;
    }

    // Create new entity based on the prototype.
    let entity = this.instantiate(prototype);

    if (!entity.setId(id))
      return null;

    // Add entity to Entities. If entity with this 'id' already
    // exists, the existing one will be used instead of the one
    // we have just created.
    //   In case of error entity will be 'null'.
    return this.add(entity);
  }

  // -> Returns 'null' if prototype object isn't found.
  protected getPrototypeObject(prototypeId: string)
  {
    // First check if 'prototypeId' is a name of a hardcoded class.
    let prototype = this.getRootPrototypeObject(prototypeId);

    if (prototype)
      return prototype;

    // If it's not a class name, it has to be an entity id.
    prototype = this.entityList.get(prototypeId);

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

  // -> Returns added entity or 'null' on failure.
  private add(entity: Entity)
  {
    let id = entity.getId();
    let existingEntity = this.entityList.get(id);

    if (existingEntity !== undefined)
    {
      ERROR("Attempt to add entity " + entity.getErrorIdString()
       + " to Entities which already exists there. Entity is"
       + " not added, existing one will be used");
      return existingEntity;
    }

    this.entityList.set(id, entity);

    return entity;
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

    if (Prototypes.has(className))
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
    let entity: Entity = Object.create(prototype);

    // Prototype inheritance in Javascript handles nonprimitive
    // properties as direct references to such properties in
    // prototype object. That means that writing to a property
    // inside a nonprimitive property changes the value on the
    // prototype, not on the instance. To prevent this, we need
    // to manually instantiate all nonprimitive properties.
    this.instantiateProperties(entity, prototype);

    return entity;
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

    let prototypeProperty = prototype[propertyName];

    // There is no point of instantating properties that don't exist
    // on prototype object or have 'null' value on it.
    if (prototypeProperty === undefined
        || prototypeProperty === null)
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
    {
      // Properties of type Map or Set can't be instantiated using
      // Object.create() because accessing them would thrown an exception,
      // so we will just create a new instance of Map() or Set().
      // (This means that prototypal inheritance won't really work for Map
      //  or Set - instance won't have access to these properties on the
      //  prototype - but at least it prevents changing the prototype by
      //  writing to it's instance.
      if (Utils.isMap(prototypeProperty))
      {
        object[propertyName] = new Map();
        return;
      }
      
      if (Utils.isSet(prototypeProperty))
      {
        object[propertyName] = new Set();  
        return;
      }

      if (Utils.isDate(prototypeProperty))
      {
        // Copy the value from the prototype.
        object[propertyName] = new Date(prototypeProperty.toString());
        return;

        /// Experiment s Proxy pro instance properties typu Date, Map a Set
        /// (nefunguje, viz komentář u PropertyProxyHandler).
        /*
        let ownValue = new Date(0);
        let handler = new PropertyProxyHandler(prototypeProperty, ownValue);

        object[propertyName] = new Proxy(ownValue, handler);
        return;
        */
      }

      // Object.create() will create a new {}, which will have
      // 'prototypeProperty' as it's prototype object.
      object[propertyName] = Object.create(prototypeProperty);
    }

    // Property we have just instantiated may have it's own
    // non-primitive properties that also need to be instantiated.
    //   Note that recursive call is done even for properties that
    // have already been instantiated on 'object', because there
    // still may be some changes deeper in the structure).
    this.instantiateProperties(object[propertyName], prototype[propertyName]);
  }

  private instantiateDate(instance: Date, prototype: Date)
  {
    ///let instance = Object.create(prototype);

    instance['_internalValue'] = null;

    Date.prototype.valueOf = function()
    {
      return 1;
    }

  }

  // Creates an invalid entity reference.
  // (This is used when an entity that is being deserialized has
  //  a reference to an entity that doesn't exist at the moment.)
  private static createInvalidReference(id: string)
  {
    let ref =
    {
      id: id,
      isvalid: function() { return false; },
      getErrorStringId: function()
      {
        return "{ Invalid (not loaded) etity, id: " + id + " }";
      },
      getId: function() { return this.id; }
    }

    // This typecast is wrong of course, but that's
    // the point - access of invalid reference should
    // generate a runtime error.
    return <any>ref;
  }
}