/*
  Part of BrutusNEXT

  Stores instances of entities (see class Entity).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Time} from '../../../shared/lib/utils/Time';
import {JsonObject} from '../../../shared/lib/json/JsonObject';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Entities} from '../../../shared/lib/entity/Entities';
import {Prototypes} from '../../../shared/lib/entity/Prototypes';
import {ServerPrototypes} from '../../../server/lib/entity/ServerPrototypes';
import {ServerApp} from '../../../server/lib/app/ServerApp';
import {NameLock} from '../../../server/lib/entity/NameLock';
import {FileSystem} from '../../../server/lib/fs/FileSystem';
import {IdProvider} from '../../../server/lib/entity/IdProvider';

export class ServerEntities extends Entities
{
  public static get DIRECTORY() { return 'entities/'; }

  constructor (timeOfBoot: Time)
  {
    super();

    this.idProvider = new IdProvider(timeOfBoot);
  }

  private idProvider: (IdProvider | null) = null;

  // ------------- Public static methods ----------------

  private static initRootPrototypeEntity(id: string, className: string)
  {
    let prototype = ServerApp.entities.getRootPrototypeObject(className);

    if (!prototype)
    {
      ERROR("Unable to load root prototype entity (id: " + id + ")"
        + " because root prototype object '" + className + "' doesn't"
        + " exist");
      return null;
    }

    return ServerApp.entities.createEntityFromPrototype(prototype, id);
  }

  // -> Returns 'null' on failure.
  public static async loadRootPrototypeById(id: string, className: string)
  {
    let path = this.getEntityPath(id);
    let jsonString = await FileSystem.readFile(path);

    if (jsonString === null)
      return null;

    let jsonObject = JsonObject.parse(jsonString);

    if (jsonObject === null)
      return null;

    let entity = ServerEntities.initRootPrototypeEntity(id, className);

    if (entity === null)
      return null;

    return ServerApp.entities.loadEntityFromJsonObject
    (
      entity,
      jsonObject,
      path
    );
  }
  
  /// This should not be used anymore - check for name existence should
  /// be done prior to generating of id.
  // // Attempts to create a name lock file.
  // // -> Returns 'false' if name change isn't allowed.
  // public static async requestEntityName
  // (
  //   id: string,
  //   name: string,
  //   cathegory: Entity.NameCathegory | null,
  //   passwordHash: (string | null) = null
  // )
  // {
  //   // Non-unique names are always available.
  //   if (cathegory === null)
  //     return true;

  //   /// Pozn.: Tohle kontroluju už v ServerEntities.createInstanceEntity().
  //   /// TODO: NameLock.save() by asi měl házet výjimku, pokud už name lock
  //   ///   existuje.
  //   // if (await ServerEntities.isEntityNameTaken(name, cathegory))
  //   //   return false;

  //   return await NameLock.save
  //   (
  //     id,
  //     name,
  //     Entity.NameCathegory[cathegory],
  //     passwordHash
  //   );
  // }

  public static async releaseName
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    await NameLock.delete
    (
      name,
      Entity.NameCathegory[cathegory]
    );
  }

  // ! Throws an exception on error.
  // Creates a new instance entity with a new id (can't be used as prototype).
  public static async createInstanceEntity<T extends Entity>
  (
    typeCast: { new (...args: any[]): T },
    prototypeName: string,
    name: string,
    // 'null' means that entity won't have unique name.
    cathegory: (Entity.NameCathegory | null) = null,
    passwordHash: (string | null) = null
  )
  : Promise<T | "NAME IS ALREADY TAKEN">
  {
    // If 'cathegory' is 'null', it means that we are requesting
    // a non-unique name so there is no need to test if it is
    // available.
    if (cathegory !== null)
    {
      if (await ServerEntities.isEntityNameTaken(name, cathegory))
        return "NAME IS ALREADY TAKEN";
    }

    let prototype = Prototypes.get(prototypeName);

    if (!prototype)
    {
      throw new Error
      (
        "Unable to create instance entity because prototype"
        + " '" + prototypeName + "' doesn't exist"
      );
    }

    let id = ServerEntities.generateId();

    /// TODO: Tuhle výjimku by mělo házet už generateId().
    if (id === null)
      throw new Error("Failed to generate entity id");

    /// Replaced with code below.
    // if
    // (
    //   !await ServerEntities.requestEntityName
    //   (
    //     id,
    //     name,
    //     cathegory,
    //     passwordHash
    //   )
    // )
    // {
    //   return "NAME IS ALREADY TAKEN";
    // }
    if (cathegory !== null)
    {
      await NameLock.save
      (
        id,
        name,
        Entity.NameCathegory[cathegory],
        passwordHash
      );
    }

    /// TODO: Asi bych měl něco udělat s locknutým jménem, pokud se mi
    // nepovede entitu vytvořit (nejspíš smazat name lock).

    let entity = await ServerApp.entities.createNewEntity
    (
      id,
      prototype,
      name,
      cathegory,
      false   // 'isPrototype'
    );

    /// TODO: Tuhle výjimku by měla házet už createNewEntity().
    if (!entity)
      throw new Error("Failed to create new instance entity (id: " + id + ")");

    // Dynamically check that entity is an
    // instance of type T and typecast to it.
    return entity.dynamicCast(typeCast);
  }

  private static async createPrototypeEntity<T extends Entity>
  (
    typeCast: { new (...args: any[]): T },
    prototype: Entity,
    prototypeName: string,
    // Entity name. Can't be unique for prototype entities.
    name: string | null
  )
  : Promise<T | null>
  {
    let id = this.generateId();

    if (id === null)
      return null;

    if (!await this.requestPrototypeName(id, prototypeName))
    {
      ERROR("Attempt to create a new prototype entity (id: " + id + ")"
        + " using prototype name '" + prototypeName + "' which is"
        + " already taken. Prototype entity is not created");
      return null;
    }

    let entity = await ServerApp.entities.createNewEntity
    (
      id,
      prototype,
      name,
      null,   // 'nameCathegory' - entity name of prototype can't be unique.
      true    // 'isPrototype'
    );

    if (entity === null)
      return null;

    await ServerEntities.save(entity);

    // Dynamically check that entity is an
    // instance of type T and typecast to it.
    return entity.dynamicCast(typeCast);
  }

  // Creates a new prototype entity with a new id.
  // -> Returns 'null' on failure.
  public static async createDecendantPrototype<T extends Entity>
  (
    typeCast: { new (...args: any[]): T },
    // Name of the ancestor prototype entity.
    ancestorName: string,
    // Name of the new prototype.
    prototypeName: string,
    // Prototype entities can have a name, but it can't
    // be unique because it will be inherited by instances
    // and descendant prototypes.
    name: (string | null) = null
  )
  : Promise<T | null>
  {
    let ancestor = Prototypes.get(ancestorName);

    if (!ancestor)
    {
      ERROR("Unable to create prototype entity because ancestor"
        + "  prototype '" + ancestorName + "' doesn't exist");
      return null;
    }

    return this.createPrototypeEntity
    (
      typeCast,
      ancestor,
      prototypeName,
      name
    );
  }

  // Creates a new prototype entity with a new id.
  // -> Returns 'null' on failure.
  public static async createRootPrototype
  (
    className: string
  )
  : Promise<Entity | null>
  {
    let prototype = ServerApp.entities.getRootPrototypeObject(className);

    if (!prototype)
    {
      ERROR("Unable to create root prototype entity because root"
        + " prototype object '" + className + "' doesn't exist");
      return null;
    }

    return this.createPrototypeEntity
    (
      Entity,     // Typecast.
      prototype,
      className,   // Prototype name.
      null         // Entity name (root prototypes don't have it).
    );
  }

  public static async isEntityNameTaken
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    return await NameLock.exists
    (
      name,
      Entity.NameCathegory[cathegory]
    );
  }

  public static async isPrototypeNameTaken(name: string)
  {
    return await NameLock.exists
    (
      name,
      // Prototype names use separate name cathegory
      // (which is not included in Entity.NameCathegory
      //  because prototype names are not entity names).
      ServerPrototypes.PROTOTYPE_NAMES_DIRECTORY
    );
  }

  // ------------- Private static methods ---------------

  // --------------- Protected methods ------------------

  // ~ Overrides Entities.saveEntity().
  protected async saveEntity(entity: Entity): Promise<boolean>
  {
    // Note: Name lock file is saved when the name is set
    // to the entity so we don't have to save it here.

    let entityId = entity.getId();

    if (entityId === null)
    {
      ERROR("Invalid entity id");
      return false;
    }

    let fileName = ServerEntities.getEntityFileName(entityId);
    let directory = ServerEntities.getEntityDirectory();

    directory = ServerEntities.enforceTrailingSlash(directory);

    let jsonString = entity.serialize(Serializable.Mode.SAVE_TO_FILE);

    // Directory might not yet exist, so we better make sure it does.
    if (await FileSystem.ensureDirectoryExists(directory) === false)
      return false;

    await FileSystem.writeFile(directory, fileName, jsonString);

    await entity.postSave();

    return true;
  }

  // ~ Overrides Entities.loadEntityById().
  // -> Returns 'null' on failure.
  protected async loadEntityById
  (
    id: string,
    loadContents = true
  )
  : Promise<Entity | null>
  {
    let path = ServerEntities.getEntityPath(id);
    let jsonString = await FileSystem.readFile(path);

    if (jsonString === null)
      return null;

    let entity = await this.loadEntityFromJsonString
    (
      {
        jsonString,
        id,
        path
      }
    );

    if (entity === null)
      return null;

    await entity.postLoad(loadContents);

    return entity;
  }

  // ~ Overrides Entities.loadEntityByName().
  // -> Returns 'undefined' if entity doesn't exist.
  // -> Returns 'null' on error.
  protected async loadEntityByName
  (
    name: string,
    cathegory: Entity.NameCathegory,
    reportNotFoundError: boolean = true
  )
  : Promise<Entity | null | undefined>
  {
    let id = await NameLock.readId
    (
      name,
      Entity.NameCathegory[cathegory],
      reportNotFoundError
    );

    if (id === undefined)
      return undefined;

    if (id === null)
      return null;

    return await this.loadEntityById(id);
  }

  // ---------------- Private methods -------------------

  private static generateId()
  {
    if (ServerApp.entities.idProvider === null)
    {
      ERROR("Invalid id provider");
      return null;
    }

    return ServerApp.entities.idProvider.generateId();
  }

  // Attempts to create a name lock file.
  // -> Returns 'false' if requested prototype name isn't available.
  private static async requestPrototypeName
  (
    id: string,
    prototypeName: string
  )
  {
    if (await this.isPrototypeNameTaken(prototypeName))
      return false;

    return NameLock.save
    (
      id,
      prototypeName,
      // Prototype names use separate name cathegory
      // (which is not included in Entity.NameCathegory
      //  because prototype names are not entity names).
      ServerPrototypes.PROTOTYPE_NAMES_DIRECTORY
    );
  }

  private static getEntityFileName(id: string)
  {
    return id + '.json';
  }

  private static getEntityDirectory()
  {
    return ServerApp.DATA_DIRECTORY + ServerEntities.DIRECTORY;
  }

  private static getEntityPath(id: string)
  {
    let directory = this.getEntityDirectory();

    directory = this.enforceTrailingSlash(directory);

    return directory + this.getEntityFileName(id);
  }

  // Makes sure that 'directory' string ends with '/'.
  private static enforceTrailingSlash(directory: string): string
  {
    if (directory.substr(directory.length - 1) !== '/')
    {
      ERROR("Directory path '" + directory + "' doesn't end with '/'."
        + "The '/' is added automatically, but it should be fixed anyways");
      return directory + '/';
    }

    return directory;
  }

  /// To be deleted.
  /*
  // -> Returns 'false' if name isn't available.
  private static async createName
  (
    id: string,
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    // Attempt to create a name lock file.
    let isNameTaken = await ServerEntities.requestEntityName
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
    if (isNameTaken)
    {
      ERROR("Attempt to create unique entity '" + name + "'"
        + " in cathegory '" + Entity.NameCathegory[cathegory] + "'"
        + " which already exists. Entity is not created");
      return false;
    }

    return true;
  }
  */

  // Creates an entity with a new id.
  // -> Returns 'null' on failure.
  private async createNewEntity
  (
    id: string,
    prototype: Entity,
    name: string | null,
    cathegory: Entity.NameCathegory | null,
    isPrototype: boolean
  )
  {
    let entity = this.createEntityFromPrototype(prototype, id);

    if (!entity)
    {
      ERROR("Failed to create entity (id: " + id + ")");
      return null;
    }

    // Entity we have just created has {} as it's 'prototypeEntity'
    // because all of it's nonprimitive properties got instantiated
    // using Object.create(). We replace it with 'null' so that
    // setPrototypeEntity() won't try to remove it from it's ancestor's
    // descendantIds (that wouldn't work because we have just created it).
    (entity as any)[Entity.PROTOTYPE_ENTITY_PROPERTY] = null;

    // Don't change 'null' value of 'prototypeEntity' if 'prototype'
    // is a root object (which have 'null' value of 'id' property),
    // because root prototype objects are not true entities.
    if ((prototype as any)[Entity.ID_PROPERTY] !== null)
    {
      // Even though prototype object is already set using
      // Object.create() when creating a new entity, we still
      // need to setup our internal link to the prototype entity
      // and set our entity's id to the prototype entity's list
      // of descendants.
      entity.setPrototypeEntity(prototype, isPrototype);
    }

    if (name !== null)
    {
      // Set name and cathegory to our entity without creating
      // a name lock file (because we have already created it).
      await entity.setName(name, cathegory, false);
    }

    entity.triggerEvent(Entity.ON_LOAD_EVENT);

    return entity;
  }
}