/*
  Part of BrutusNEXT

  Stores instances of entities (see class Entity).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {JsonObject} from '../../../shared/lib/json/JsonObject';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Entities} from '../../../shared/lib/entity/Entities';
import {Prototypes} from '../../../shared/lib/entity/Prototypes';
import {ServerApp} from '../../../server/lib/app/ServerApp';
import {NameLock} from '../../../server/lib/entity/NameLock';
import {FileSystem} from '../../../server/lib/fs/FileSystem';
import {IdProvider} from '../../../server/lib/entity/IdProvider';
import {EntityProxyHandler} from
   '../../../shared/lib/entity/EntityProxyHandler';

export class ServerEntities extends Entities
{
  public static get DIRECTORY() { return 'entities/'; }

  constructor (timeOfBoot: Date)
  {
    super();

    this.idProvider = new IdProvider(timeOfBoot);
  }

  private idProvider: IdProvider = null;

  // ------------- Public static methods ----------------

  // Creates a new instance entity with a new id (can't be used as prototype).
  // -> Returns 'null' on failure.
  public static async createInstance<T extends Entity>
  (
    typeCast: { new (...args: any[]): T },
    prototypeName: string,
    name: string,
    // 'null' means that entity won't have unique name.
    cathegory: Entity.NameCathegory = null
  )
  : Promise<T>
  {
    let prototype = Prototypes.get(prototypeName);

    if (!prototype)
    {
      ERROR("Unable to create instance entity because prototype"
        + " '" + prototypeName + "' doesn't exist");
      return null;
    }

    let entity = await ServerApp.getEntities().createNewEntity
    (
      prototype,
      name,
      cathegory,
      false   // 'isPrototype'
    );

    // Dynamically check that entity is an
    // instance of type T and typecast to it.
    return entity.dynamicCast(typeCast);
  }

  // Creates a new prototype entity with a new id.
  // -> Returns 'null' on failure.
  public static async createPrototype<T extends Entity>
  (
    typeCast: { new (...args: any[]): T },
    // Name of the ancestor prototype entity.
    ancestorName: string,
    // Name of the new prototype.
    prototypeName: string,
    // Prototype entities can have a name, but it can't
    // be unique because it will be inherited by instances
    // and descendant prototypes.
    name: string = null
  )
  : Promise<T>
  {
    let ancestor = Prototypes.get(ancestorName);

    if (!ancestor)
    {
      ERROR("Unable to create prototype entity because ancestor"
        + "  prototype '" + ancestorName + "' doesn't exist");
      return null;
    }

    let entity = await ServerApp.getEntities().createNewEntity
    (
      ancestor,
      name,
      null,   // 'nameCathegory' - entity name of prototype can't be unique.
      true    // 'isPrototype'
    );

    // Dynamically check that entity is an
    // instance of type T and typecast to it.
    return entity.dynamicCast(typeCast);
  }

    // Creates a new prototype entity with a new id.
  // -> Returns 'null' on failure.
  public static async createRootPrototype(className: string): Promise<Entity>
  {
    let prototype = ServerApp.getEntities().getRootPrototypeObject(className);

    if (!prototype)
    {
      ERROR("Unable to create root prototype entity because root"
        + " prototype object '" + className + "' doesn't exist");
      return null;
    }

    return await ServerApp.getEntities().createNewEntity
    (
      prototype,
      // 'name' (root prototype entities don't have an entity name).
      null,
      // 'nameCathegory' - entity name of prototype can't be unique.
      null,
      // 'isPrototype'
      true
    );
  }

  public static async isNameTaken
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    return NameLock.exists
    (
      name,
      Entity.NameCathegory[cathegory]
    );
  }

  // ------------- Private static methods ---------------

  // --------------- Protected methods ------------------

  /// Deprecated.
  /*
  // ~ Overrides Entities.generateId().
  // Creates a unique entity string id.
  protected generateId(): string
  {
    return this.idProvider.generateId();
  }
  */

  // ~ Overrides Entities.requestName().
  // Checks if requested name is available, creates
  // a name lock file if it is.
  // -> Returns 'false' if name change isn't allowed.
  protected async requestName
  (
    id: string,
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    // Renaming to a non-unique name is always allowed.
    if (cathegory === null)
      return true;

    if (ServerEntities.isNameTaken(name, cathegory))
      return false;

    return NameLock.save
    (
      id,
      name,
      Entity.NameCathegory[cathegory]
    );
  }

  protected async releaseName
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    NameLock.delete
    (
      name,
      Entity.NameCathegory[cathegory]
    );
  }

  // ~ Overrides Entities.saveEntity().
  protected async saveEntity(entity: Entity)
  {
    // Note: Name lock file is saved when the name is set
    // to the entity so we don't have to save it here.

    let fileName = this.getEntityFileName(entity.getId());
    let directory = this.getEntityDirectory();

    directory = this.enforceTrailingSlash(directory);

    let jsonString = entity.serialize(Serializable.Mode.SAVE_TO_FILE);

    // Directory might not yet exist, so we better make sure it does.
    if (await FileSystem.ensureDirectoryExists(directory) === false)
      return false;

    await FileSystem.writeFile(jsonString, directory + fileName);
  }

  // ~ Overrides Entities.loadEntityById().
  // -> Returns 'null' on failure.
  protected async loadEntityById(id: string): Promise<Entity>
  {
    let path = this.getEntityPath(id);

    let jsonString = await FileSystem.readFile(path);

    let jsonObject = JsonObject.parse(jsonString);

    if (jsonObject === null)
      return null;

    let entity = this.createEntityFromJsonObject(jsonObject, id, path);

    if (!entity)
      return null;

    return entity.deserialize(jsonObject, path);
  }

  // ~ Overrides Entities.loadEntityByName().
  protected async loadEntityByName
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    let id = await NameLock.readId(name, Entity.NameCathegory[cathegory]);

    if (!id)
      return null;

    return await this.loadEntityById(id);
  }

  /// Deprecated.
  /*
  // ~ Overrides Entities.createPrototype().
  // Creates a new prototype entity with a new id.
  // -> Returns 'null' on error.
  protected async createPrototype
  (
    ancestor: Entity,
    prototypeName: string,
    name: string
  )
  {
    let prototype = this.getPrototypeObject(ancestorId);

    if (!prototype)
      return null;

    return await this.createNewEntity
    (
      prototype,
      name,
      null,   // 'nameCathegory' - entity name of prototype can't be unique.
      true    // 'isPrototype'
    );
  }
  */

  // ---------------- Private methods -------------------

  private getEntityFileName(id: string)
  {
    return id + '.json';
  }

  private getEntityDirectory()
  {
    return ServerApp.DATA_DIRECTORY + ServerEntities.DIRECTORY;
  }

  private getEntityPath(id: string)
  {
    let directory = this.getEntityDirectory();

    directory = this.enforceTrailingSlash(directory);

    return directory + this.getEntityFileName(id);
  }

  // Makes sure that 'directory' string ends with '/'.
  private enforceTrailingSlash(directory: string): string
  {
    if (directory.substr(directory.length - 1) !== '/')
    {
      ERROR("Directory path '" + directory + "' doesn't end with '/'."
        + "The '/' is added automatically, but it should be fixed anyways");
      return directory + '/';
    }

    return directory;
  }

  // -> Returns 'null' if instance cannot be created.
  private createEntityFromJsonObject
  (
    jsonObject: Object,
    id: string,
    path: string
  )
  {
    if (!jsonObject)
      return null;

/// TODO
/// Tohle má smysl pouze pokud se createEntityFromJsonObject() bude
/// volat taky při deserializaci z protokolu (což se zatím neděje).
    // If 'id' parameter is 'null', it means that we are not loading from
    // file but rather using a client-server communication protocol. In
    // that case entity 'id' is not saved as file name (because no files
    // are sent over the protocol) but rather as a regular 'id' property.
    if (id === null)
    {
      id = jsonObject[Entity.ID_PROPERTY];

      if (!id)
      {
        ERROR("Missing or invalid id in JSON when deserializing"
          + " an entity. Entity is not created");
        return null;
      }
    }

    // Check if there is a 'prototypeEntity' property in json Object.
    let prototypeReference = jsonObject[Entity.PROTOTYPE_ENTITY_PROPERTY];

    if (!prototypeReference)
    {
      ERROR("Missing or invalid 'prototypeReference' in JSON"
          + " when deserializing an entity (id '" + id + "')"
          + " from file " + path + ". Entity is not created");
        return null;
    }

    // Read 'id' from entity reference record.
    let prototypeId = this.readPrototypeId(prototypeReference, id, path);

    if (!prototypeId)
    {
      ERROR("Missing or invalid prototype 'id' in"
       + " " + Entity.PROTOTYPE_ENTITY_PROPERTY
       + " reference record in JSON when deserializing"
       + " an entity (id '" + id + "')."
       + " Entity is not created");
      return null;
    }

    return this.createExistingEntity(prototypeId, id);
  }

  private readPrototypeId
  (
    prototypeReference: Object,
    id: string,
    path: string
  )
  {
    if (prototypeReference === null || prototypeReference === undefined)
    {
      ERROR("Invalid prototype reference when deserializing entity"
        + " " + id + " from file " + path);
      return null;
    }

    let prototypeId = prototypeReference[Entity.ID_PROPERTY];

    if (prototypeId === null || prototypeId === undefined)
    {
      ERROR("Invalid prototype id when deserializing entity"
        + " " + id + " from file " + path);
      return null
    }

    return prototypeId;
  }

  // ~ Overrides Entities.createNewEntity().
  // Creates an entity with a new id.
  // -> Returns 'null' on failure.
  private async createNewEntity
  (
    prototype: Entity,
    name: string,
    cathegory: Entity.NameCathegory,
    isPrototype: boolean
  )
  {
    // Generate a new id.
    let id = this.idProvider.generateId();

    if (name !== null && cathegory !== null)
    {
      // Attempt to create a name lock file.
      let isNameAvailable = await this.requestName
      (
        id,
        name,
        cathegory
      );

      // If 'name' isn't available, we have just wasted an id.
      // (It's unavoidable because id is written to the name lock
      //  file so we need to generate id prior to writing the file.
      //    We could first test if the name lock file exists of
      //  course, but it would add a disk read operation even when
      //  the name is available, which is by far the most common
      //  scenario.)
      if (!isNameAvailable)
        return null;
    }

    // We use bare (unproxified) entity as a prototype object.
    let barePrototype = EntityProxyHandler.deproxify(prototype);

    // Create, proxify and register a new entity.
    let entity = this.createEntityFromPrototype(barePrototype, id);

    // Set a prototype entity.
    // (Even though prototype object is already set using
    //  Object.create() when creating a new object, we still
    //  need to setup our internal link to the prototype entity
    //  and set our entity's id to the prototype entity's list
    //  of descendants.)
    entity.setPrototypeEntity(prototype, isPrototype);

    if (name !== null)
    {
      // Set name and cathegory to our entity without creating
      // a name lock file (because we have already created it).
      await entity.setName(name, cathegory, false);
    }

    return entity;
  }
}


/// To be deleted.
/*
{
  // //------------------ Private data ---------------------

  // // Hashmap<[ string, EntityRecord ]>
  // //   Key: string id
  // //   Value: { entity proxy, list of entity proxy handlers }
  // private entityRecords = new Map();

  // constructor(private idProvider: IdProvider) { }

  // // ---------------- Public methods --------------------

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

  // // Každá entita může sloužit jako prototyp, takže
  // // není důvod prototypové entity vyrábět nějak jinak.
  // // -> Returns 'null' on failure.
  // public createPrototypeEntity<T extends Entity>
  // (
  //   entityName: string,
  //   className: string,
  //   ancestorNameOrId: string
  // )
  // {
  //   // Check that prototype named 'className' doesn't exist yet.
  //   if (!this.isPrototypeNameAvailable(className))
  //     // Error is already reported by isPrototypeNameAvailable.
  //     return;

  //   let ancestorEntity = this.getAncestorEntity
  //   (
  //     entityName,
  //     className,
  //     ancestorNameOrId
  //   );

  //   if (ancestorEntity === null)
  //     // Error is already reported by getAncestorEntity().
  //     return null;

  //   // Create a new entity based on prototype entity.
  //   let entity = this.createEntityFromPrototype(ancestorEntity);

  //   // This must be done before adding the new entity to Prototypes,
  //   // because 'className' will be used as a key in prototypeObjects hashmap
  //   // (prototype will be indentified by it's 'className', not 'entityName').
  //   entity.className = className;

  //   ///Server.prototypeManager.setAsPrototype(entity, ancestorEntity);

  //   // Note:
  //   //   We are not going to save the new prototype entity right now,
  //   // user has to save it herself.
  //   // (In order to correctly save the change, ancestor entity must be
  //   //  saved as well (because it's descendantIds array has changed) and
  //   //  if the ancestor entity is a hardcoded entity, Prototypes
  //   //  needs to be saved as well).
  // }
  //

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

  // /// Tohohle se taky chci zbavit.
  // /// - Tak nakonec ne. Je to potřeba, když se loaduje reference
  // ///   ze souboru.
  // /// - loadnout invalid referenci je ok. Není ok updatovat invalid
  // ///   referenci, když v manageru už je jiná reference pro stejné id.
  // ///
  // // -> Returns existing reference if entity already exists in Entities.
  // //    Returns invalid reference if entity with such id doen't exist yet.
  // //      (you can then use entity.load() to load if from disk)
  // public createReference(id: string): Entity
  // {
  //   if (this.has(id))
  //     return this.get(id, Entity);

  //   return this.createInvalidEntityReference(id);
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

  // // --------------- Private methods -------------------

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

  // // Creates an entity proxy with null 'internalEntity'.
  // // Doesn't add it to the manager - so if you want to use
  // // this reference, you have to call .getCurrentReference()
  // // first and .isValid() next to check if it became valid.
  // private createInvalidEntityReference(id: string)
  // {
  //   let handler = new EntityProxyHandler();

  //   handler.id = id;

  //   // Set handler.entity to null.
  //   handler.invalidate();

  //   let proxy = new Proxy({}, handler);

  //   return proxy;
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

  //   let entity = ServerApp.prototypeManager.createInstance(prototypeEntity);

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
  //   let entity = ServerApp.prototypeManager.createInstance(prototypeEntity);

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
  //     ServerApp.prototypeManager.getPrototypeObject(className);

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
  //   let test = ServerApp.prototypeManager.getPrototypeObject(className);

  //   if (test !== undefined)
  //   {
  //     ERROR("Unable to create new prototype '" + className + "'"
  //       + " because it already exists");
  //     return false;
  //   }

  //   return true;
  // }

  // /// Deprecated.
  // // Searches for ancestor entity both in Entities and Prototypes.
  // // -> Returns 'null' if ancestor entity isn't found.
  // private getAncestorEntity
  // (
  //   name: string,
  //   className: string,
  //   ancestorNameOrId: string
  // )
  // {
  //   // Search for prototype entity both in Entities and Prototypes.
  //   let ancestorEntity = this.getPrototypeEntity
  //   (
  //     name,
  //     // This parameter will be used to search in Prototypes.
  //     ancestorNameOrId,
  //     // This parameter will be used to search in Entities.
  //     ancestorNameOrId
  //   );

  //   if (ancestorEntity === undefined)
  //   {
  //     ERROR("Unable to create new prototype '" + className + "'"
  //       + " because ancestor entity '" + ancestorNameOrId + "' doesn't"
  //       + " exist");
  //     return null;
  //   }

  //   return ancestorEntity;
  // }
  //
}
*/