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
import {Utils} from '../../../shared/lib/utils/Utils';
///import {App} from '../../../shared/lib/app/App';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {PropertyAttributes} from
  '../../../shared/lib/class/PropertyAttributes';
import {Entities} from '../../../shared/lib/entity/Entities';

// Note: Entity can't be abstract class, because variable 'Entity'
//   is used to dynamically typecast entities and that wouldn't be
//   possible if Entity class was abstract, because constructor
//   of abstract class is not of compatible type with constructor
//   of nonabstract class (see Entities.loadEntityById() for example).
export class Entity extends Serializable
{
  public static get NAME_PROPERTY()             { return 'name'; }
  public static get PROTOTYPE_ENTITY_PROPERTY() { return 'prototypeEntity'; }
  private static get INSTANCE_IDS_PROPERTY()    { return 'instanceIds'; }

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
  public prototypeName: string = null;

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
    private static instanceIds: PropertyAttributes =
    {
      saved: true,
      edited: false,
      sentToClient: false,
      sentToServer: false
    };

  // Set of ids of entities that use this entity as their prototype
  // object and are prototypes themselves.
  // (We must use ids instead of references because when an instance
  //  of an entity is deleted, we need to find it in 'instanceIds' to
  //  remove it from there.)
  private descendantIds = new Set<string>();
    private static descendantIds: PropertyAttributes =
    {
      saved: true,
      edited: false,
      sentToClient: false,
      sentToServer: false
    };

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
        && entity.isValid() === true;
  }

  // --------------- Public accessors -------------------

  public getName() { return this.name; }

  public async setName
  (
    name: string,
    cathegory: Entity.NameCathegory = null,
    // This should only be 'false' if you have created
    // a name lock file prior to calling setName().
    createNameLock = true
  )
  {
    this.name = name;
    this.nameCathegory = cathegory;

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
        + " This must never happen, each entity must have an id");
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
      FATAL_ERROR("Property 'id' has been set to prototype"
        + " object rather than to the instance");
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
    // Note: We can't use Entity.isValid() here, because prototypeEntity
    // is deproxified so isValid() can't be used on it.
    if (prototypeEntity === null || prototypeEntity === undefined)
    {
      ERROR("Attempt to set an invalid prototype to entity"
        + " " + this.getErrorIdString());
      return;
    }

    // When a new entity is created, it doesn't have
    // own 'prototypeEntity' property so there is no
    // need to update it.
    // (It does a 'prototypeEntity' inherited from
    //  prototype object of course.)
    if (this.prototypeEntity !== null)
    {
      // Remove 'this.id' from the old prototype's
      // 'instanceIds' or 'descendantIds' depending
      // on where it is present.
      this.prototypeEntity.removeChildId(this.getId());
    }

    if (isPrototype)
      prototypeEntity.addDescendantId(this.getId());
    else
      prototypeEntity.addInstanceId(this.getId());

    this.prototypeEntity = prototypeEntity;

    // Save the prototype entity because we have just added
    // a descendant or an instance to it.
    Entities.save(prototypeEntity);
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

  // Serializes entity and all its ancestors. Writes
  // results to 'data' arrat, starting with root prototype.
  public serializeTree(data: Array<string>, mode: Serializable.Mode)
  {
    if (this.prototypeEntity !== null)
    {
      this.prototypeEntity.serializeTree(data, mode);
    }

    data.push(this.serialize(mode));
  }

  private invalidateProperties(object: Object)
  {
    for (let propertyName in object)
    {
      /// Není třeba, idčko se pamatuje v closure.
      /*
      // Leave the 'id' property (for debugging purposes).
      if (propertyName === Entity.ID_PROPERTY)
        continue;
      */

      // Only invalidate own properties.
      if (!object.hasOwnProperty(propertyName))
        continue;

      let property = object[propertyName];
      let isPrimitive = Utils.isPrimitiveType(property);
      let isEntity = (property[Entity.ID_PROPERTY] !== undefined);

      // Recursively invalidate nonprimitive (object) properties
      // (but skip references to another entities).
      if (!isPrimitive && !isEntity)
        this.invalidateProperties(property);

      delete object[propertyName];
    }

    // Set 'null' to the prototype of 'object'.
    // (Object.setPrototypeOf() slows down any code that accesses
    //  object with modified prototype but that's ok here because
    //  we are just making sure that any access to 'object' ends
    //  with an exception.)
    Object.setPrototypeOf(object, null);
  }

  // All entities are valid until 'invalidate()' is called on them.
  public isValid() { return true; }

  // Invalidates all properties so any further access to this
  // entity will throw an exception.
  public invalidate()
  {
    let id = this.id;

    this.invalidateProperties(this);

    // Set a 'isValid()' method that will report that this
    // entity is not valid anymore.
    this.isValid = function() { return false; }

    // Set a 'getErrorIdString()' function - 'id' of this
    // entity will be printed because it's held in closure.
    this.getErrorIdString = function()
    {
      // Note: 'id' variable is read from invalidate() function closure.
      if (id === null)
        id = 'null';

      if (id === undefined)
        id = 'undefined';

      return "{ Invalid (deleted) entity, id: " + id + " }";
    }
  }

  // -> Returns 'true' if 'id' has been succesfuly deleted from
  //    either this.instanceIds or this.descendantIds.
  private removeChildId(id: string)
  {
    if (this.instanceIds.delete(id))
      return true;

    if (this.descendantIds.delete(id))
      return true;

    ERROR("Attempt to delete child id '" + id + "' from"
      + " prototype " + this.getErrorIdString() + " but that"
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

  /// Nevím, jestli to bude k něčemu potřeba, ale když už to tu mám...
  public hasInstances()
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

  public isPrototypeEntity()
  {
    // Root prototype objects don't have a 'prototypeEntity'.
    if (this.prototypeEntity === null)
      return true;

    if (this.prototypeEntity === undefined)
    {
      ERROR("Invalid 'prototypeEntity' in " + this.getErrorIdString());
      return false;
    }

    return this.prototypeEntity.hasDescendant(this);
  }

  // Called after an entity is saved to file.
  public async postSave() {}

  // Called after an entity is loaded from file.
  public async postLoad() {}

  public dynamicCast<T>(Class: { new (...args: any[]): T })
  {
    // Dynamic type check - we make sure that entity is inherited from
    // requested class (or an instance of the class itself).
    if (!(this instanceof Class))
    {
      FATAL_ERROR("Type cast error: entity " + this.getErrorIdString()
        + " is not an instance of requested type (" + Class.name + ")");

      return null;
    }

    return <any>this;
  }
  /// Deprecated
  /*
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
  */
  
  /// Deprecated.
  /*
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
  */

/// To be deleted.
/*
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
*/

  // ~ Overrides Serializable.getErrorIdString().
  // Returns something like 'Character (id: d-imt2xk99)'
  // (indended for use in error messages).
  public getErrorIdString()
  {
    // Access 'this.id' directly (not using this.getId()) because
    // it would trigger another ERROR() which would precede logging
    // of the ERROR when getErrorIdString() is called. That would
    // give confusing information about the actual error.
    let id = this.id;

    if (this.id === undefined)
      id = "undefined";

    if (this.id === null)
      id = "null";

    return "{ className: " + this.getClassName() + ","
      + " name: " + this.name + ", id: " + id + " }";
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

  /// To be deleted.
  /*
  // ~ Overrides Serializable.saveToJsonObject().
  protected saveToJsonObject
  (
    instance: Serializable,
    mode: Serializable.Mode
  )
  : Object
  {
    // Unproxify the instance
    // (so 'for .. in' operator works on it).
    instance = EntityProxyHandler.deproxify(instance);

    return super.saveToJsonObject(instance, mode);
  }
  */

  // ~ Overrides Serializable.createEntitySaver().
  // -> Returns a SaveableObject which saves Entity to Json object
  //      (using it's saveToJsonObject()) as a special object
  //      with className 'Reference' and property 'id' containing
  //      an Array representation of hashmap contents.  
  protected createEntitySaver(entity: Serializable)
  {
    if (entity === null)
    {
      FATAL_ERROR("Null entity");
      return;
    }

    let id = entity[Entity.ID_PROPERTY];

    if (!id)
    {
      FATAL_ERROR("Attempt to serialize an entity with an invalid id");
      return;
    }

    let saver = Serializable.createSaver(Serializable.REFERENCE_CLASS_NAME);

    // Entity is saved as it's string id to property 'id'.
    saver[Entity.ID_PROPERTY] = id;

    return saver;
  }

  // ~ Overrides Serializable.readEntityReference().
  // Converts 'param.sourceProperty' to a reference to an Entity.
  //   If entity with 'id' loaded from JSON already exists in Entities,
  // it will be returned. Otherwise an 'invalid reference will be
  // created and returned.
  // -> Retuns an entity or an invalid entity reference.
  protected readEntityReference
  (
    sourceProperty: Object,
    propertyName: string,
    pathString: string
  )
  {
    if (!sourceProperty)
      return null;
    
    let id = sourceProperty[Entity.ID_PROPERTY];

    if (id === undefined || id === null)
    {
      ERROR("Missing or invalid 'id' property when loading entity"
        + " reference '" + propertyName + "'" + pathString);
    }

    return Entities.getReference(id);
  }

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
    ///PROTOTYPE, /// prototypenames are in a completely separate cathegory.
                  /// (they are not entity names)
    // Unique world locations (Rooms, Realms, Areas, the name
    // of the world itself, etc.)
    WORLD
  }
}