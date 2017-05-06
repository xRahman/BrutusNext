/*
  Part of BrutusNEXT

  Extends Serializable with the ability to remember it's string id.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {App} from '../../../shared/lib/App';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {PropertyAttributes} from
  '../../../shared/lib/class/PropertyAttributes';
import {EntityManager} from '../../../shared/lib/entity/EntityManager';

export class Entity extends Serializable
{
  public static get NAME_PROPERTY()          { return "name"; }
  public static get ID_PROPERTY()            { return 'id'; }
  public static get PROTOTYPE_PROPERTY()  { return "prototype"; }
  private static get INSTANCE_IDS_PROPERTY() { return "instanceIds"; }

  // ----------------- Private data ----------------------

  // Entity name.
  private name = null;

  // In what cathegory is the name unique (accounts, characters, world...).
  // 'null' means that name is not unique.
  private nameCathegory: Entity.NameCathegory = null;

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

  // Reference to an entity which serves as prototype object to this
  // entity. Only root prototype entities (created in ClassFactory)
  // have 'null' value of 'prototype'.
  private prototype: Entity = null;

  // Set of ids of entities that use this entity as their prototype
  // object and they are not prototypes themselves.
  //   Including entities saved on disk but not present in
  // memory at the moment.
  // (We must use ids instead of references because when an instance
  //  of an entity is deleted, we need to find it in 'instanceIds' to
  //  remove it from there.)
  private instanceIds = new Set<string>();

  // Set of ids of entities that use this entity as their prototype
  // object and are prototypes themselves.
  // (We must use ids instead of references because when an instance
  //  of an entity is deleted, we need to find it in 'instanceIds' to
  //  remove it from there.)
  private descendantIds = new Set<string>();

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

  /// Moved to EntityManager.createEntityIstance().
  /*
  // Creates an instance of Entity with given 'prototype' and 'id'.
  // Instance is then proxified and registered in EntityManager.
  // -> Returns 'null' in case of error.
  public static createInstance(prototype: Entity, id: string)
  {
    // There is no need to include Proxy objects to the prototype
    // chain (it would even lead to errors), so we are going to
    // deproxify 'prototype' before we use it as a prototype object.
    let barePrototype = EntityProxyHandler.deproxify(prototype);

    let instance = ClassFactory.createInstanceFromPrototype(barePrototype);
/// Moved to ClassFactory.createEntityInstance().
    // // Object.create() will create a new object with 'prototype'
    // // as it's prototype object. This will ensure that all 'own'
    // // properties of 'prorotype' (those initialized in constructor
    // // or in class body of prototype) become 'inherited' properties
    // // on the new instance (so that changing the value on prototype
    // // will change the value for all instances that don't have that
    // // property overriden).
    // let instance = Object.create(barePrototype);

    // // Prototype inheritance in Javascript handles nonprimitive
    // // properties as direct references to such properties in
    // // prototype object. That means that writing to a property
    // // inside a nonprimitive property changes the value on the
    // // prototype, not on the instance. To prevent this, we need
    // // to manually instantiate all nonprimitive properties.
    // instance.instantiateProperties(instance, prototype);

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
  */

  // --------------- Public accessors -------------------

  public getName() { return this.name; }
  // This method is overriden on the server in class UniqueEntity.
  public async setName(name: string, cathegory: Entity.NameCathegory = null)
  {
    let oldName = this.name;
    let oldCathegory = this.nameCathegory;

    // Check if requested name is available.
    // (This will always be false on client because entity name change
    //  is disabled there.)
    if (!await EntityManager.requestEntityName(this.getId(), name, cathegory))
      return false;

    // Make the old name available again.
    if (oldName && oldCathegory)
      await EntityManager.releaseEntityName(oldName, oldCathegory)

    this.name = name;

  }

  public getNameCathegory() { return this.nameCathegory; }

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

  public getPrototype() { return this.prototype; }

  // Sets a 'prototype' entity as prototype object to 'this'
  // entity. If 'isPrototype' is 'true', this entity's id
  // will be added to the prototype's 'descendatIds', otherwise
  // it will be added to it's 'instanceIds'.
  // (The difference is, that all prototype entities listed in
  //  their prototype's 'descendantIds' are pre-loaded at the
  //  start of the appliaction. Entities listed in their prototype's
  //   'instanceIds' may not have descendants or instances themselves
  //  and are not loaded automatically.)
  public setPrototype(prototype: Entity, isPrototype: boolean)
  {
    if (!Entity.isValid(prototype))
    {
      ERROR("Attempt to set an invalid prototype to entity"
        + " " + this.getErrorIdString());
      return;
    }

    if (this.prototype !== null)
    {
      if (this.prototype.isValid())
      {
        // Remove 'this.id' from the old prototype's
        // 'instanceIds' or 'descendantIds' depending
        // on where it is present.
        this.prototype.removeChildId(this.getId());
      }
      else
      {
        ERROR("Attempt to set prototype to entity"
          + " " + this.getErrorIdString() + " which"
          + " doesn't have a valid prototype");
      }
    }

    if (isPrototype)
      prototype.addInstanceId(this.getId());
    else
      prototype.addDescendantId(this.getId());

    this.prototype = prototype;
  }

  public getInstanceIds()
  {
    return this.instanceIds;
  }

  /// Z nějakých důvodů jsem tuším setoval komplet
  /// celá instanceIds - třeba to už není potřeba.
  /*
  public setInstanceIds(instanceIds: Set<string>)
  {
    this.instanceIds = instanceIds;
  }
  */

  // -> Returns 'true' if 'id' has been succesfuly deleted from
  //    either this.instanceIds or this.descendantIds.
  private removeChildId(id: string)
  {
    if (this.instanceIds.delete(id))
      return true;

    if (this.descendantIds.delete(id))
      return true;

    ERROR("Attempt to delete child id '" + id + "' from"
      + " prototype " + this.getErrorIdString + " but that"
      + " id is not present neither in instanceIds nor in"
      + " desendantIds of this prototype");
    return false;
  }

  private addInstanceId(id: string)
  {
    // Check that id is not yet present in the list.
    if (this.instanceIds.has(id))
    {
      ERROR("Attempt to add instance id " + id + " to prototype"
        + " " + this.getErrorIdString() + " which is already there");
      return;
    }

    this.instanceIds.add(id);
  }

  private addDescendantId(id: string)
  {
    // Check that instanceId is not yet present in the list.
    if (this.descendantIds.has(id))
    {
      ERROR("Attempt to add descendant id " + id + " to prototype"
        + " " + this.getErrorIdString() + " which is already there");
      return;
    }

    this.descendantIds.add(id);
  }

  // ---------------- Public methods --------------------

  public async save()
  {
    await App.saveEntity(this);
  }

  public async load()
  {
    /// TODO: Tohle je asi blbost. Loadováním entita vznikne - volat
    /// load na existující entitě nedává smysl (je třeba ji zahodit
    /// a vytvořit znovu, jinak se to blbě mergne).
    await App.loadEntity(this);
  }

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

  /// Nikde se nevolá, nejspíš nebude potřeba
  /*
  public isHardcodedPrototypeEntity()
  {
    // Hardcoded prototype entities are the roots of respective
    // prototype trees so they don't have 'prototypeId' themselves.
    return this.prototypeId === null;
  }
  */

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
    {
      return "{ className: " + this.className + ","
           + " name: " + this.name + ", id: null }";
    }

    return "{ className: " + this.className + ", name: " + this.name + ","
      + " id: " + this.getId() + " }";
  }

  // Entity removes itself from EntityLists so it can no longer
  // be searched by name, etc. This doesn't remove entity from EntityManager
  // (this method needs to be overriden by descendants).
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

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module Entity
{
  // Names of unique-named entities are unique only within each cathegory,
  // so you can have for example account Rahman and character Rahman.
  // Lowercased names of cathegories also serve as names of directories
  // in ./data where name lock files are located. So there will be
  // file './data/names/account/Rahman.json'
  // and './data/names/character/Rahman.json'.
  export enum NameCathegory
  {
    ACCOUNT,
    CHARACTER,
    PROTOTYPE,
    // Various world locations.
    // (Rooms, Realms, Areas, the name of the world itself, etc.)
    WORLD
  }
}