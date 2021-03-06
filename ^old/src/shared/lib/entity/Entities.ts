/*
  Part of BrutusNEXT

  Stores instances of entities (see class Entity).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {JsonObject} from '../../../shared/lib/json/JsonObject';
import {App} from '../../../shared/lib/app/App';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Classes} from '../../../shared/lib/class/Classes';
import {Prototypes} from '../../../shared/lib/entity/Prototypes';
import {Entity} from '../../../shared/lib/entity/Entity';

export abstract class Entities
{
  // ----------------- Private data ---------------------

  // List of all entities that are loaded in memory.
  // Key:   entity id
  // Value: entity
  private entityList = new Map<string, Entity>();

  // ---------------- Protected data -------------------- 

  // List of instances of hardcoded entity classes that are
  // used as prototype objects for root prototype entities.
  // Key:   class name
  // Value: instance of the class that is used as prototype object
  protected rootObjects = new Map<string, Entity>();

  // ------------- Public static methods ----------------

  // -> Returns 'true' if enity is available.
  public static has(id: string)
  {
    if (App.entities === null)
    {
      ERROR("Unexpected 'null' value");
      return false;
    }

    return App.entities.entityList.has(id);
  }

  
  // ! Throws an exception on error.
  public static getEntity(id: string): Entity
  {
    if (App.entities === null)
    {
      throw new Error
      (
        "Unable to get entity (id '" + id + "')"
        + " because App.entities is not valid"
      );
    }

    let entity = App.entities.entityList.get(id);

    if (entity === undefined)
    {
      throw new Error
      (
        "Unable to get entity (id '" + id + "')"
        + " because it is not in Entities"
      );
    }

    if (!entity.isValid())
    {
      throw new Error
      (
        "Unable to get entity (id '" + id + "')"
        + " because it is not valid"
      );
    }
    
    return entity;
  }

  // Removes entity from memory but doesn't delete it from disk
  // (this is used for example when player quits the game).
  // Also removes it from entity lists so it can no longer
  // be searched for.
  public static release(entity: Entity)
  {
    if (!entity || !entity.isValid())
    {
      ERROR("Attempt to release invalid entity " + entity.getErrorIdString()
        + " from Entities");
      return;
    }

    // Remove entity from entity lists so it can no longer be searched for.
    entity.removeFromLists();

    if (!App.entities)
    {
      ERROR("Unexpected 'null' value");
      return;
    }

    let id = entity.getId();

    if (!id)
    {
      ERROR("Invalid entity id");
      return;
    }


    // Remove the record from hashmap.
    if (!App.entities.entityList.delete(id))
    {
      /// TODO: Tahle hláška je nejspíš blbost. Entitu by měly
      /// vyrábět pouze Entities a rovnou si ji přidat do seznamu.
      /// (I tak je na místě ošetřit tenhle případ, jen ta error
      ///  hláška by měla bejt jinak)
      ERROR("Attempt to remove entity " + entity.getErrorIdString()
        + " from Entities which is not there. Maybe you forgot to"
        + " call addToLists() wen you created it?");
    }

    // Recursively delete all properties and set the prototype to 'null.
    // This way if anyone has a reference to this entity and tries to use
    // it, it will throw an exception (so we will know that someone tries
    // to use a deleted entity).
    entity.invalidate();
  }

  public static async save(entity: Entity)
  {
    if (!App.entities)
    {
      ERROR("Unexpected 'null' value");
      return;
    }

    return await App.entities.saveEntity(entity);
  }

  // -> Returns 'null' on failure.
  public static async loadEntityById<T extends Entity>
  (
    id: string,
    typeCast: { new (...args: any[]): T },
    loadContents = true
  )
  : Promise<T | null>
  {
    if (App.entities === null)
    {
      ERROR("Unexpected 'null' value");
      return null;
    }

    let entity = await App.entities.loadEntityById(id, loadContents);

    if (!entity)
      return null;

    // Dynamically check that entity is an
    // instance of type T and typecast to it.
    return entity.dynamicCast(typeCast);
  }

  // -> Returns 'undefined' if entity doesn't exist.
  // -> Returns 'null' on error.
  public static async loadEntityByName<T extends Entity>
  (
    typeCast: { new (...args: any[]): T },
    name: string,
    cathegory: Entity.NameCathegory,
    reportNotFoundError: boolean = true
  )
  : Promise<T | null | undefined>
  {
    if (!App.entities)
    {
      ERROR("Unexpected 'null' value");
      return null;
    }

    let entity = await App.entities.loadEntityByName
    (
      name,
      cathegory,
      reportNotFoundError
    );

    if (entity === undefined)
    {
      if (reportNotFoundError)
        ERROR("Failed to load unique entity '" + name + "' in cathegory"
        + " '" + Entity.NameCathegory[cathegory] + "'. No such entity is"
        + " saved");
      return undefined;
    }

    if (entity === null)
    {
      ERROR("Failed to load unique entity '" + name + "' in cathegory"
        + " '" + Entity.NameCathegory[cathegory] + "'");
      return null;
    }

    // Dynamically check that entity is an
    // instance of type T and typecast to it.
    return entity.dynamicCast(typeCast);
  }

  // ! Throws an exception on error.
  public static loadEntityFromJsonString<T extends Entity>
  (
    jsonString: string,
    typeCast: { new (...args: any[]): T },
    overwrite = false
  )
  : T
  {
    if (!App.entities)
    {
      throw new Error
      (
        "Unable to get load entity from jsonString"
        + " because App.entities is not valid"
      );
    }

    let entity = App.entities.loadEntityFromJsonString
    (
      {
        jsonString,
        overwrite
      }
    );

    if (!entity || !entity.isValid())
      throw new Error("Failed to load entity from json string");

    // Dynamically check that entity is an
    // instance of type T and typecast to it.
    return entity.dynamicCast(typeCast);
  }

  // ---------------- Public methods --------------------

  // -> Returns existing reference if entity already exists in Entities.
  //    Returns invalid reference if entity with such 'id' isn't there.
  public getReference(id: string): Entity
  {
    if (!App.entities)
    {
      FATAL_ERROR("Unexpected 'null' value");
      return this.createInvalidReference(id); // This is never called.
    }

    let entity = App.entities.entityList.get(id);
    
    if (entity)
      return entity;

    return this.createInvalidReference(id);
  }

  // Creates instances of hardcoded classes that are used
  // as prototype objects for root prototypes.
  public createRootObjects()
  {  
    for (let [className, Class] of Classes.entities)
      this.rootObjects.set(className, new Class);
  }

  // --------------- Protected methods ------------------

  protected abstract async saveEntity(entity: Entity): Promise<boolean>;

  protected abstract async loadEntityById
  (
    id: string,
    loadContents: boolean
  )
  : Promise<Entity | null>;

  protected abstract async loadEntityByName
  (
    name: string,
    cathegory: Entity.NameCathegory,
    reportNotFoundError: boolean
  )
  : Promise<Entity | null | undefined>;

  protected loadEntityFromJsonObject
  (
    entity: Entity,
    jsonObject: Object,
    path: string | null
  )
  {
    if (!entity)
      return null;

    entity.recreateEntity(jsonObject, path);

    if (!entity)
      return null;

    return entity;
  }

  // -> Returns 'null' on failure.
  protected loadEntityFromJsonString
  (
    {
      jsonString,
      // Id needs to be provided when loading from file because
      // it's saved as file name rather than into the file.
      id = <string | null> null,
      // Path should be provide when loading from file. It's only
      // used in error messages.
      path = <string | null> null,
      // Overwrite existing entity
      // (when overwrite is 'true', attempt to overwrite existing
      //  entity will log an error).
      overwrite = false
    }:
    {
      jsonString: string;
      id?: string;
      path?: string;
      overwrite?: boolean
    }
  )
  {
    if (!jsonString)
      return null;

    let jsonObject = JsonObject.parse(jsonString);

    if (jsonObject === null)
      return null;

    let entity = this.createEntityFromJsonObject
    (
      jsonObject,
      id,
      path,
      overwrite
    );

    if (entity === null)
      return null;

    return this.loadEntityFromJsonObject(entity, jsonObject, path);
  }

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

    if (entity === null)
      return null;

    if (!entity.setId(id))
      return null;

    // Add entity to Entities.
    //   In case of error entity will be 'null'.
    return this.add(entity);
  }

  // -> Returns 'null' if prototype object isn't found.
  protected getPrototypeObject(prototypeId: string)
  {
    // First check if 'prototypeId' is a name of a hardcoded class.
    let prototype: (Entity | undefined | null) =
      this.getRootPrototypeObject(prototypeId);

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

  // Creates and proxifies entity with provided 'id'.
  // -> Returns 'null' if entity couldn't be created.
  protected createEntityUsingExistingId
  (
    prototypeId: string,
    id: string
  )
  : Entity | null
  {
    let prototype = this.getPrototypeObject(prototypeId);

    if (!prototype)
      return null;

    return this.createEntityFromPrototype(prototype, id);
  }

  // -> Returns added entity or 'null' on failure.
  private add(entity: Entity)
  {
    if (!entity)
    {
      ERROR("Attempt to addd invalid entity to Entities");
      return null;
    }

    if (!entity.isValid())
    {
      ERROR("Attempt to add invalid entity " + entity.getErrorIdString()
        + " to Entities");
      return null;
    }

    let id = entity.getId();

    if (id === null)
    {
      ERROR("Invalid entity id");
      return null;
    }

    let existingEntity = this.entityList.get(id);

    if (existingEntity !== undefined)
    {
      ERROR("Attempt to add entity " + entity.getErrorIdString()
        + " to Entities which is already there. Entity is not"
        + " added");
      // Note: Even though it would make sense to return 'existingEntity'
      //   here, we are not going to do it because it would mask the
      //   error. By returning 'null', whoever called us can test for
      //   it and log an ERROR which will help resolve the problem.
      return null;
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

    let prototypeProperty = (prototype as any)[propertyName];

    // There is no point of instantating properties that don't exist
    // on prototype object or have 'null' value on it.
    if (prototypeProperty === undefined
        || prototypeProperty === null)
      return;

    // Primitive properties (numbers, strings, etc) don't have to
    // be instantiated because Javascript prototype inheritance
    // handles them correctly.
    if (typeof (object as any)[propertyName] !== 'object')
      return;

    // Do not recursively instantiate propeties of other entities
    // (that could lead to infinite recursion among other things).
    if ((object as any)[propertyName] instanceof Entity)
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
        (object as any)[propertyName] = new Map();
        return;
      }
      
      if (Utils.isSet(prototypeProperty))
      {
        (object as any)[propertyName] = new Set();  
        return;
      }

      if (Utils.isDate(prototypeProperty))
      {
        ERROR("Attempt to instantiate property of type Date."
          + " Don't use Date, use Time instead. Property is"
          + " not instantiated");
        (object as any)[propertyName] = null;
        return;
      }

      // Object.create() will create a new {}, which will have
      // 'prototypeProperty' as it's prototype object.
      (object as any)[propertyName] = Object.create(prototypeProperty);
    }

    // Property we have just instantiated may have it's own
    // non-primitive properties that also need to be instantiated.
    //   Note that recursive call is done even for properties that
    // have already been instantiated on 'object', because there
    // still may be some changes deeper in the structure).
    this.instantiateProperties
    (
      (object as any)[propertyName],
      (prototype as any)[propertyName]
    );
  }

  // Creates an invalid entity reference.
  // (This is used when an entity that is being deserialized has
  //  a reference to an entity that doesn't exist at the moment.)
  private createInvalidReference(id: string)
  {
    let ref =
    {
      id: id,
      isValid: function() { return false; },
      getErrorIdString: function()
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

  private readPrototypeIdFromPrototypeEntity
  (
    prototypeReference: Object,
    id: string,
    path: string | null
  )
  {
    if (prototypeReference === null || prototypeReference === undefined)
    {
      ERROR("Invalid prototype reference when deserializing entity"
        + " " + id + " from file " + path);
      return null;
    }

    let prototypeId = (prototypeReference as any)[Entity.ID_PROPERTY];

    if (prototypeId === null || prototypeId === undefined)
    {
      ERROR("Invalid prototype id when deserializing entity"
        + " " + id + " from file " + path);
      return null
    }

    return prototypeId;
  }

  // -> Returns 'null' if there is no valid 'id' property in 'jsonObject'.
  private readIdFromJsonObject(jsonObject: Object)
  {
    let id = (jsonObject as any)[Entity.ID_PROPERTY];

    if (!id)
    {
      ERROR("Missing or invalid id in JSON when deserializing"
        + " an entity. Entity is not created");
      return null;
    }

    return id;
  }

  private reportMisssingPrototypeEntityProperty
  (
    id: string,
    path: string | null
  )
  {
    let pathstring = (path !== null) ? (" from file " + path) : ("");

    ERROR("Missing or invalid '" + Entity.PROTOTYPE_ENTITY_PROPERTY + "'"
      + " property in JSON when deserializing an entity (id '" + id + "')"
      + pathstring + ". Entity is not created");
  }

  private reportMissingPrototypeIdProperty(id: string)
  {
    ERROR("Missing or invalid prototype 'id' in"
       + " " + Entity.PROTOTYPE_ENTITY_PROPERTY
       + " reference record in JSON when deserializing"
       + " an entity (id '" + id + "')."
       + " Entity is not created");
  }

  // -> Returns 'null' on error.
  private readPrototypeId
  (
    prototypeEntity: Entity,
    jsonObject: Object,
    id: string,
    path: string | null
  )
  {
    let prototypeId: (string | null) = null;

    if (prototypeEntity === null)
    {
      // If 'prototypeEntity' is 'null', it means that we are deserializing
      // a root prototype entity (which doesn't have a prototype entity of
      // course). In that case we use 'className' as a prototypeId (it will
      // point to a root prototype object instead of an entity).
      prototypeId = (jsonObject as any)[Entity.CLASS_NAME_PROPERTY];
    }
    else
    {
      // If there was a 'prototypeEntity' record, read 'id' from it.
      prototypeId = this.readPrototypeIdFromPrototypeEntity
      (
        prototypeEntity,
        id,
        path
      );
    }

    return prototypeId;
  }

  private getPrototypeId
  (
    jsonObject: Object,
    id: string,
    path: string | null
  )
  {
    // Check if there is a 'prototypeEntity' property in json Object.
    let prototypeEntity = (jsonObject as any)[Entity.PROTOTYPE_ENTITY_PROPERTY];

    // Note: 'null' is a valid value of 'prototypeEntity'
    //   for root prototype entities.
    if (prototypeEntity === undefined)
    {
      this.reportMisssingPrototypeEntityProperty(id, path);
      return null;
    }

    let prototypeId = this.readPrototypeId
    (
      prototypeEntity,
      jsonObject,
      id,
      path
    );

    if (!prototypeId)
    {
      this.reportMissingPrototypeIdProperty(id);
      return null;
    }

    return prototypeId;
  }

  // -> Returns 'undefined' if entity with 'id' isn't present in
  //    Entities (so there is nothing to overwrite).
  //    Returns 'null' on error.
  private getEntityToOverwrite
  (
    id: string,
    prototypeId: string
  )
  : Entity | undefined | null
  {
    let existingEntity = Entities.getEntity(id);

    if (existingEntity === undefined)
      return undefined;

    let prototypeEntity = existingEntity.getPrototypeEntity();

    // Note: It's ok for root prototype entities to have 'null'
    // prototype entity.
    if (prototypeEntity === null)
    {
      // Note: Root prototype entities use 'className' as 'prototypeId'.
      if (prototypeId !== existingEntity.getClassName())
      {
        ERROR("Attempt to overwrite existing root prototype"
          + " entity " + existingEntity.getErrorIdString()
          + " using data from json string containing"
          + " different prototypeId. That's not possible,"
          + " because changing prototypes is not implemented"
          + " yet. Entity will not be overwritten");
        return null;
      }

      return existingEntity;
    }

    if (prototypeEntity.getId() !== prototypeId)
    {
      ERROR("Attempt to ovewrite existing entity"
        + " " + existingEntity.getErrorIdString()
        + " using data from json string containing"
        + " different prototypeId. That's not possible,"
        + " because changing prototypes is not implemented"
        + " yet. Entity will not be overwritten");
      return null;
    }

    return existingEntity;
  }

  // -> Returns 'null' if instance cannot be created.
  private createEntityFromJsonObject
  (
    jsonObject: Object,
    id: string | null,
    path: string | null,
    overwrite: boolean
  )
  {
    if (!jsonObject)
      return null;

    // If 'id' parameter is 'null', it means that we are not loading from
    // file but rather using a client-server communication protocol. In
    // that case entity 'id' is not saved as file name (because no files
    // are sent over the protocol) but rather as a regular 'id' property.
    if (id === null)
      id = this.readIdFromJsonObject(jsonObject);

    if (!id)
      return null;

    let prototypeId = this.getPrototypeId(jsonObject, id, path);

    if (!prototypeId)
      return null;

    if (overwrite)
    {
      // This will return 'undefined' if entity with given 'id' isn't
      // present in Entities so there is nothing to overwrite.
      let entityToOverwrite = this.getEntityToOverwrite(id, prototypeId);

      if (entityToOverwrite !== undefined)
        return entityToOverwrite;
    }

    return this.createEntityUsingExistingId(prototypeId, id);
  }
}