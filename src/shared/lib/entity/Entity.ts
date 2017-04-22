/*
  Part of BrutusNEXT

  Extends Serializable with the ability to remember it's string id.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {PropertyAttributes} from
  '../../../shared/lib/class/PropertyAttributes';
import {EntityManager} from '../../../shared/lib/entity/EntityManager';
import {EntityProxyHandler} from
  '../../../shared/lib/entity/EntityProxyHandler';
import {EntityRecord} from '../../../shared/lib/entity/EntityRecord';

export class Entity extends Serializable
{
  public static get ID_PROPERTY()            { return 'id'; }
  public static get PROTOTYPE_ID_PROPERTY()  { return "prototypeId"; }
  private static get INSTANCE_IDS_PROPERTY() { return "instanceIds"; }

  // ----------------- Private data ----------------------

  // ------------------------------------------------- //
  //                   Unique entity id                //
  // ------------------------------------------------- //

  private id: string = null;
    private static id: PropertyAttributes =
    {
      // Property 'id' is not saved to file, because it is saved
      // as the name of the saved file (like 7-iu5by22s.json).
      saved: false,
      sentToClient: true,
      sentToServer: true
    };

  // ------------------------------------------------- //
  //                 Prototype linking                 //
  // ------------------------------------------------- //

  // Id of entity which serves as prototype object to this entity.
  //   This needs to be saved in orded to know what prototype object
  // to use when creating this entity.
  //   Hardcoded class prototype entities have null 'prototypeId'.
  private prototypeId: string = null;

  // Set of ids of entities that use this entity as their prototype
  // object - including entities saved on disk but not present in
  // memory at the moment.
  // (We must use ids instead of references because when an instance
  //  entity is deleted, we need to find it in 'instanceIds' to
  //  remove it from there.)
  private instanceIds = new Set<string>();

  // ------------------------------------------------- //
  //               Symbolic entity naming              //
  // ------------------------------------------------- //

  // Symbolic name of this entity, which is relative to the
  // 'sLocation' entity (in other words: entity 'sLocation'
  // has a hasmap 'sNames' which maps 'sName' of this entity
  // to the reference to this entity).
  private sName: string = null;

  // Reference to the entity which can translate our 'sName'
  // to the reference to this entity.
  private sLocation: Entity = null;

  // Hasmap translating symbolic names of entities to respective
  // references.
  //   Key:   'sName'
  //   Value: reference to entity identified by 'sName'
  private sNames = new Map<string, Entity>();

  // ------------- Private static methods ---------------

  // ------------- Public static methods ----------------

  public static isValid(entity: Entity)
  {
    return entity !== null
        && entity !== undefined
        // This will be trapped by EntityProxyHandler.
        && entity.isValid() === true;
  }

  // Creates an instance of Entity with given 'prototype' and 'id'.
  // Instance is then proxified and registered in EntityManager.
  // -> Returns 'null' in case of error.
  public static createInstance(prototype: Entity, id: string)
  {
    // There is no need to include Proxy objects to the prototype
    // chain (it would even lead to errors), so we are going to
    // deproxify 'prototype' before we use it as a prototype object.
    let barePrototype = EntityProxyHandler.deproxify(prototype);

    // Object.create() will create a new object with 'prototype'
    // as it's prototype object. This will ensure that all 'own'
    // properties of 'prorotype' (those initialized in constructor
    // or in class body of prototype) become 'inherited' properties
    // on the new instance (so that changing the value on prototype
    // will change the value for all instances that don't have that
    // property overriden).
    let instance = Object.create(barePrototype);

    // Prototype inheritance in Javascript handles nonprimitive
    // properties as direct references to such properties in
    // prototype object. That means that writing to a property
    // inside a nonprimitive property changes the value on the
    // prototype, not on the instance. To prevent this, we need
    // to manually instantiate all nonprimitive properties.
    instance.instantiateProperties(instance, prototype);

    // Set id to our new entity instance
    // (this shouldn't fail because we have just created it, but
    //  better be sure).
    if (instance.setId(id) === false)
      return null;

    // Hide instance beind a Proxy object which will report
    // access to properties of invalid entity. Also create
    // an EntityRecord that will be added to EntityManager.
    let entityRecord = this.createEntityRecord(instance);

    // Add entity to EntityManager. If a record with this 'id'
    // already exists there, the existing one will be used instead
    // of the one we have just created.
    //   In case of error entity will be 'null'.
    let entity = EntityManager.add(entityRecord);

    if (entity === null)
      return null;
  
    // Now we are sure that entity has been sucessfuly registered
    // in EntityManager so we can add it's id to prototype's instanceIds.
    prototype.addInstanceId(id);

    // And also add the prototype's id as the entity's prototypeId.
    entity.prototypeId = prototype.getId();

    return entity;
  }

  // Creates an invalid entity. Access to this entity's properties
  // will be reported as error.
  // (This is used when an entity that is being deserialized has
  //  a reference to an entity that doesn't exist at the moment.)
  public static createInvalidEntity(id: string)
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

  // Hides 'entity' behind a Proxy object that will report
  // access to an invalid entity.
  // -> Returns entity record.
  private static createEntityRecord(entity: Entity): EntityRecord
  {
    let handler = new EntityProxyHandler();

    handler.id = entity.getId();
    handler.entity = entity;

    // Create a Javascript Proxy Object that will trap access
    // of entity properties (using EntityProxyHandler we have
    // just created) and report en error if an invalid (deleted)
    // entity is accessed.
    let entityProxy = new Proxy({}, handler);

    return new EntityRecord(entityProxy, handler);
  }

  /*
  // Hides 'entity' behind a Proxy object that will report
  // access to an invalid entity.
  // -> Returns entity proxy.
  private static createEntityProxy(entity: Entity): Entity
  {
    if (entity === null || entity === undefined)
    {
      ERROR("Invalid parameter 'entity'");
      return null;
    }

    // Create a Javascript Proxy Object that will trap access
    // of entity properties (using EntityProxyHandler we have
    // just created) and report en error if an invalid (deleted)
    // entity is accessed.
    return new Proxy({}, handler);
  }
  */

  // Ensures that all non-primitive properties of 'prototype'
  // are instantiated on 'object'. 
  private instantiateProperties(object: any, prototype: any)
  {
    for (let property in object)
      this.instantiateProperty(object, prototype, property); 
  }

  // Ensures that if 'property' of 'object' is non-primitive,
  // it is recursively instantiated as an empty Object inherited
  // from the respective 'property' on 'prototype' object.
  private instantiateProperty(object: any, prototype: any, property: string)
  {
    if (prototype === undefined || prototype === null)
    {
      ERROR("Invalid prototype object");
      return;
    }

    // There is no point of instantating properties that don't have any
    // real value.
    if (prototype[property] === undefined || prototype[property] === null)
      return;

    // Primitive properties (numbers, strings, etc) don't have to
    // be instantiated because Javascript prototype inheritance
    // handles them correctly.
    if (typeof object[property] !== 'object')
      return;

    // This check allows re-instantiating of properties of existing
    // instance when prototype is changed. Properties that already
    // are instantiated (they are 'own' properties of object) are
    // not overwritten.
    if (!object.hasOwnProperty(property))
      // Object.create() will create a new {}, which will have
      // 'prototypeProperty' as it's prototype.
      object[property] = Object.create(prototype[property]);

    // Property we have just instantiated may have it's own
    // non-primitive properties that also need to be instantiated.
    //   Note that recursive call is done even for properties that
    // have already been instantiated on 'object', because there
    // still may be some changes deeper in the structure).
    this.instantiateProperties(object[property], prototype[property]);
  }

  // --------------- Public accessors -------------------

  public getId()
  {
    // If we don't have own 'id' property, this.id would return
    // id of our prototype object (thanks to inheritance), which
    // is not our id (id has to be unique for each entity instance).
    if (!this.hasOwnProperty(Entity.ID_PROPERTY) || this.id === null)
    {
      ERROR("Attempt to get 'id' of an entity which doesn't have an id."
        + "This must never happen, each entity must have an id");
      return null;
    }

    return this.id;
  }

  // -> Returns 'true' on success, 'false' on failure.
  public setId(id: string): boolean
  {
    // Id can only be set once.
    //   We need to check if we have own property 'id'
    // (not just the one inherited from our prototype),
    // because if we don't, value of 'this.id' would be
    // that of our prototype.
    if (this.hasOwnProperty(Entity.ID_PROPERTY) && this.id !== null)
    {
      ERROR("Attempt to set id of entity " + this.getErrorIdString()
        + " that already has an id. Id is not set");
      return false;
    }

    this.id = id;

    if (this.hasOwnProperty('id') === false)
    {
      FATAL_ERROR("Property 'id' has been set to prototype object"
        + " rather than to the instance. This probably means that"
        + " entity proxy has been used as prototype entity instead"
        + " of unproxified entity");
        return false;
    }

    return true;
  }

  public getPrototypeId() { return this.prototypeId; }

  /// Tohle by nemělo být public - prototypeId by se mělo
  /// automaticky setnout při instanciaci entity.
  public setPrototypeId(prototypeId: string)
  {
    this.prototypeId = prototypeId;
  }

  public getInstanceIds()
  {
    return this.instanceIds;
  }

  public setInstanceIds(instanceIds: Set<string>)
  {
    this.instanceIds = instanceIds;
  }

  private addInstanceId(instanceId: string)
  {
    // Check that instanceId is not yet present in the list.
    if (this.instanceIds.has(instanceId))
    {
      ERROR("Attempt to add instanceId " + instanceId + " to prototype"
        + " " + this.getErrorIdString() + " which is already there");
      return;
    }

    this.instanceIds.add(instanceId);
  }
  /*
  public addInstance(instance: Entity)
  {
    let instanceId = instance.getId();

    if (instance === null || instance === undefined)
    {
      ERROR("Invalid parameter 'instance'");
      return;
    }

    // Check that instanceId is not yet present in the list.
    if (this.instanceIds.has(instanceId))
    {
      ERROR("Failed to add instance " + instance.getErrorIdString()
        + " to prototype " + this.getErrorIdString() + " because it"
        + " is already listed as an instance of this prototype");
      return;
    }

    this.instanceIds.add(instanceId);
  }
  */

  // ---------------- Public methods --------------------

  public isPrototype()
  {
    // We have to make sure that we check our own property
    // (because we surely have a nonempty 'instanceIds'
    //  property inherited from our prototype).
    if (!this.hasOwnProperty(Entity.INSTANCE_IDS_PROPERTY))
      return false;

    // We are a prototype if there is at least one
    // entity that use us as it's prototype object.
    return this.instanceIds.size !== 0;
  }

  public isHardcodedPrototypeEntity()
  {
    // Hardcoded prototype entities are the roots of respective
    // prototype trees so they don't have 'prototypeId' themselves.
    return this.prototypeId === null;
  }

  /// Je tohle stále pravda? Mám pocit, že automatické sebeoživování
  /// starých referencí jsem zavrhnul.
  /*
  // Compares entities by string ids.
  // (You should never compare two references directly, because
  //  there can be more than one reference for any single entity
  //  because references to entity proxies are used. Always use
  //  this method instead.) 
  public equals(entity: Entity)
  {
    if (entity === null || entity.isValid() === false)
    {
      ERROR("Attempt to compare entity " + this.getErrorIdString()
        + " to an invalid entity");
      return false;
    }

    if (this.isValid() === false)
    {
      ERROR("Attempt to compare entity " + entity.getErrorIdString()
        + " to invalid entity " + this.getErrorIdString());
      return false;
    }

    return this.getId() === entity.getId(); 
  }
  */

  // This function exists only for typescript to stop complaining
  // that it doesn't exist. It should never be executed, however,
  // because 'dynamicCast()' call should always be trapped by
  // entity proxy (see EntityProxyHandler.get()).
  public dynamicCast<T>(typeCast: { new (...args: any[]): T })
  {
    ERROR("Entity.dynamicCast() function should never be called."
      + " You somehow managed to get your hands on direct reference"
      + " to entity instead of a proxy. That must never happen");

    return null;
  }

  // This function exists only for typescript to stop complaining
  // that it doesn't exist. It should never be executed, however,
  // because 'dynamicTypeCheck()' call should always be trapped by
  // entity proxy (see EntityProxyHandler.get()).
  private dynamicTypeCheck<T>(type: { new (...args: any[]): T })
  {
    ERROR("Entity.dynamicTypeCheck() function should never be called."
      + " You somehow managed to get your hands on direct reference"
      + " to entity instead of a proxy. That must never happen");

    return false;
  }

  // This function exists only for typescript to stop complaining
  // that it doesn't exist. It should never be executed, however,
  // because 'isValid()' call should always be trapped by
  // entity proxy (see EntityProxyHandler.get()).
  public isValid(): boolean
  {
    ERROR("Entity.isValid() function should never be called. You"
      + " somehow managed to get your hands on direct reference to"
      + " entity " + this.getErrorIdString() + " instead of a proxy."
      + " That must never happen");

    return false;
  }

  // Returns something like 'Connection (id: d-imt2xk99)'
  // (indended for use in error messages).
  public getErrorIdString()
  {
    if (this.getId() === null)
      return "{ className: " + this.className + ", id: null }";

    return "{ className: " + this.className + ", id: " + this.getId() + " }";
  }

  // Entity removes itself from EntityLists so it can no longer
  // be searched by name, etc. This doesn't remove entity from EntityManager.
  // (this method needs to be overriden by descendants)
  public removeFromLists() {}

  // --------------- Protected methods ------------------

  /*
  // This method exists only to prevent accidental
  // delcaring of 'then' property. See error message
  // inside this method for more info.
  private then()
  {
    FATAL_ERROR("Attempt to access 'then' property"
      + " of entity " + this.getErrorIdString() + "."
      + " Property 'then' is accessed by async functions"
      + " when they return value in order to check if"
      + " the value is already a Promise or it needs"
      + " to be promisified. If you see this error, it"
      + " can either mean that you have declared a method"
      + " or class variable named 'then' somewhere - in"
      + " that case just choose another name for it, or"
      + " TODO"
      + "It's an ugly hack, but it"
      + " forces us never to use property named 'then'");
  }
  */
}