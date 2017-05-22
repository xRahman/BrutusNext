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

    await entity.postSave();
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

    entity.deserialize(jsonObject, path);

    if (!entity)
      return null;

    await entity.postLoad();

    return entity;
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