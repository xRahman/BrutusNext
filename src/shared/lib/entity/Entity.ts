/*
  Part of BrutusNEXT

  Entity is an Object that:
  - has a unique id
  - can be serialized and deserialized
  - can be inherited from another entity using
    true prototypal inheritance

  True prototypal inheritance means that an instance
  is created using Object.create() so it is just an
  empty {} with no own properties and that all it's
  nonprimitive properties are also instantiated using
  Obect.create() against the matching property on the
  prototype entity.
    This way all properties inicialized on prototype
  entity by it's constructor or direct inicialization
  in class body in typescript class will actually be
  set to prototype object, not the instance. Properties
  set to the instance will also never modify the prototype
  (unlinke in javascript prototypal inheritance where
  nonprimitive properties of the instance are references
  to the matching properties on the prototype so writing
  to them actually modify the prototype object instead of
  creating own propety on the instance).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {App} from '../../../shared/lib/app/App';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {PropertyAttributes} from
  '../../../shared/lib/class/PropertyAttributes';
import {Entities} from '../../../shared/lib/entity/Entities';

export class Entity extends Serializable
{
  public static get NAME_PROPERTY()             { return "name"; }
  public static get ID_PROPERTY()               { return 'id'; }
  public static get PROTOTYPE_ENTITY_PROPERTY() { return "prototypeEntity"; }
  private static get INSTANCE_IDS_PROPERTY()    { return "instanceIds"; }

  // ----------------- Private data ----------------------

  // Entity name.
  private name = null;

  // In what cathegory is the name unique (accounts, characters, world...).
  // 'null' means that name is not unique.
  // (Note that name lock file names are lowercased so 'Rahman' also
  //  counts as 'rahman', 'rAhman', etc.).
  // (Also note that only instances can have unique names. Entity name
  //  of a prototype entity is inherited by it's instances and descendant
  //  prototypes so it woudn't really be unique even if we set a name
  //  cathegory to it.)
  private nameCathegory: Entity.NameCathegory = null;

  // All prototypeNames have to be unique. This is enforced
  // by creating a name lock file in /data/names/prototypes
  // for each prototype entity. This is not a NameCathegory
  // however, a prototype entity can have both unique 'name'
  // and a 'prototypeName' (which is also unique).
  // Root prototypes (prototype entities for hardcoded
  // classes like Account or Character) use their class
  // name as their 'prototypeName'.
  //   Dynamically created prototypes override this value
  // with their own prototype name.
  //   Instance entities inherit this property from their
  // prototype entity so you can use it to quickly check
  // what prototype is the instance entity based on.
  public prototypeName = null;

  // ------------------------------------------------- //
  //                   Unique entity id                //
  // ------------------------------------------------- //

  private id: string = null;
    private static id: PropertyAttributes =
    {
      // Property 'id' is not saved to file, because it is saved
      // as the name of the saved file (like 7-iu5by22s.json).
      saved: false,
      edited: false
      /// 'true' is implicit so we don't need to list this.
      ///sentToClient: true,
      ///sentToServer: true
    };

  // ------------------------------------------------- //
  //                 Prototype linking                 //
  // ------------------------------------------------- //

  // Reference to entity which serves as prototype object to this
  // entity. Only root prototype entities (created in Classes)
  // have 'null' value of 'prototypeEntity'.
  private prototypeEntity: Entity = null;

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

  // ------------- Public static methods ----------------

  public static isValid(entity: Entity)
  {
    return entity !== null
        && entity !== undefined
        // This will be trapped by EntityProxyHandler.
        && entity.isValid() === true;
  }

  /// Moved to Entities.createEntityIstance().
  /*
  // Creates an instance of Entity with given 'prototype' and 'id'.
  // Instance is then proxified and registered in Entities.
  // -> Returns 'null' in case of error.
  public static createInstance(prototype: Entity, id: string)
  {
    // There is no need to include Proxy objects to the prototype
    // chain (it would even lead to errors), so we are going to
    // deproxify 'prototype' before we use it as a prototype object.
    let barePrototype = EntityProxyHandler.deproxify(prototype);

    let instance = Classes.createInstanceFromPrototype(barePrototype);
/// Moved to Classes.createEntityInstance().
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
    // an EntityRecord that will be added to Entities.
    let entityRecord = this.createEntityRecord(instance);

    // Add entity to Entities. If a record with this 'id'
    // already exists there, the existing one will be used instead
    // of the one we have just created.
    //   In case of error entity will be 'null'.
    let entity = Entities.add(entityRecord);

    if (entity === null)
      return null;
  
    // Now we are sure that entity has been sucessfuly registered
    // in Entities so we can add it's id to prototype's instanceIds.
    prototype.addInstanceId(id);

    // And also add the prototype's id as the entity's prototypeId.
    entity.prototypeId = prototype.getId();

    return entity;
  }
  */

  // --------------- Public accessors -------------------

  public getName() { return this.name; }

  // -> Returns 'false' if name isn't available.
  public async setName
  (
    name: string,
    cathegory: Entity.NameCathegory = null,
    // This should only be 'false' if you have created
    // a name lock file prior to calling setName().
    createNameLockFile = true
  )
  {
/// TODO: Před setnutím jména je třeba vyhodit entitu z NameListů
/// přes this.removeFromNameLists() a pokud je to prototyp, tak taky
/// z Prototypes. Po setnutí ji tam zase přidat.

    let oldName = this.name;
    let oldCathegory = this.nameCathegory;

    if (createNameLockFile)
    {
      // Check if requested name is available.
      // (This will always be false on client because entity name change
      //  is disabled there.)
      if (!await Entities.requestName(this.getId(), name, cathegory))
        return false;
    }

    // Make the old name available again.
    if (oldName && oldCathegory)
      await Entities.releaseName(oldName, oldCathegory)

    this.name = name;

    return true;
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

  public getPrototypeEntity() { return this.prototypeEntity; }

  // Sets a 'prototype' entity as prototype object to 'this'
  // entity. If 'isPrototype' is 'true', this entity's id
  // will be added to the prototype's 'descendatIds', otherwise
  // it will be added to it's 'instanceIds'.
  // (The difference is, that all prototype entities listed in
  //  their prototype's 'descendantIds' are pre-loaded at the
  //  start of the appliaction. Entities listed in their prototype's
  //   'instanceIds' may not have descendants or instances themselves
  //  and are not loaded automatically.)
  public setPrototypeEntity(prototypeEntity: Entity, isPrototype: boolean)
  {
    if (!Entity.isValid(prototypeEntity))
    {
      ERROR("Attempt to set an invalid prototype to entity"
        + " " + this.getErrorIdString());
      return;
    }

    // When a new entity is created, it's 'prototytypeEntity'
    // is null so there is no need to update it.
    if (this.prototypeEntity)
    {
      // Remove 'this.id' from the old prototype's
      // 'instanceIds' or 'descendantIds' depending
      // on where it is present.
      this.prototypeEntity.removeChildId(this.getId());
    }

    if (isPrototype)
      prototypeEntity.addInstanceId(this.getId());
    else
      prototypeEntity.addDescendantId(this.getId());

    this.prototypeEntity = prototypeEntity;
  }

  public getInstanceIds()
  {
    return this.instanceIds;
  }

  public getDescendantIds()
  {
    return this.descendantIds;
  }

  /// Z nějakých důvodů jsem tuším setoval komplet
  /// celá instanceIds - třeba to už není potřeba.
  /*
  public setInstanceIds(instanceIds: Set<string>)
  {
    this.instanceIds = instanceIds;
  }
  */

  // ---------------- Public methods --------------------

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

  public hasDescendant(entity: Entity)
  {
    return this.descendantIds.has(entity.getId());
  }

  public isPrototypeEntity()
  {
    if (!this.prototypeEntity)
    {
      ERROR("Invalid 'prototypeEntity' in " + this.getErrorIdString());
      return false;
    }

    return this.prototypeEntity.hasDescendant(this);
  }

  // Called after an entity is saved to file.
  public async postSave()
  {
    await Entities.save(this);
  }

  // Called after an entity is loaded from file.
  public async postLoad() {}

  /// Tohle je zbytečné, může se rovnou volat Entities.loadEntityById().
  /*
  public static async loadById(id: string)
  {
    return await Entities.loadEntityById(id);
  }
  */

  /// Tohle je zbytečné, může se rovnou volat Entities.loadEntityByName().
  /*
  public static async loadByName
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    return await Entities.loadEntityByName(name, cathegory);
  }
  */

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
      return "{ className: " + this.getClassName() + ","
           + " name: " + this.name + ", id: null }";
    }

    return "{ className: " + this.getClassName() + ", name:"
      + " " + this.name + ", id: " + this.getId() + " }";
  }

  // Entity adds itself to all relevant lists (except to Entities)
  // so it can be searched for by name, abbreviations, etc.
  // (this method needs to be overriden by descendants).
  public addToLists()
  {
    this.addToNameLists();
    this.addToAbbrevLists();
  }

  // Entity removes itself from all lists (except from Entities)
  // so it can no longer be searched for by name, abbreviations, etc.
  // (this method needs to be overriden by descendants).
  public removeFromLists()
  {
    this.removeFromNameLists();
    this.removeFromAbbrevLists();
  }

  // --------------- Protected methods ------------------

  protected addToNameLists() {}
  protected addToAbbrevLists() {}

  protected removeFromNameLists() {}
  protected removeFromAbbrevLists() {}

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
    // Unique world locations (Rooms, Realms, Areas, the name
    // of the world itself, etc.)
    WORLD
  }
}