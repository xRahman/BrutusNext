/*
  Part of BrutusNEXT

  Manages prototype entities.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Classes} from '../../../shared/lib/class/Classes';
import {Prototypes} from '../../../shared/lib/entity/Prototypes';
import {Entities} from '../../../shared/lib/entity/Entities';
import {FileManager} from '../../../server/lib/fs/FileManager';
import {Entity} from '../../../shared/lib/entity/Entity';

export class ServerPrototypes extends Prototypes
{
  // ---------------- Public methods --------------------

  // ~ Overrides Prototypes.init().
  // Creates root prototype entities if they don't exist on
  // the disk or loads them if they do. Then recursively loads
  // all prototype entities inherited from them.
  public async init()
  {
    await this.initRootPrototypes();
    await this.loadDescendantPrototypes();
  }

  // --------------- Private methods -------------------- 

  // Creates root prototype entities if they don't exist yet or
  // loads them from disk.
  private async initRootPrototypes()
  {
    for (let className of Classes.entities.keys())
    {
      let prototypeEntity = await this.initRootPrototypeEntity(className);

      if (prototypeEntity)
        // Add the prototype entity to this.prototypes hashmap.
        this.prototypes.set(className, prototypeEntity);
    }
  }

  // Loads prototype entity 'className' form the disk if it's save
  // exits, creates a new prototype entity otherwise.
  // -> Returns 'null' on error.
  private async initRootPrototypeEntity(className: string)
  {
    // We are going to save one reading from the disk by
    // surpressing error reporting for file read operation
    // so we can use the result to test if file exist.
    let id = await FileManager.readIdFromNameLockFile
    (
      className,
      Entity.NameCathegory.PROTOTYPE,
      false  // Do not log that file doesn't exist.
    );

    // If name lock file exists, we use the id loaded
    // from it to load prototype entity from disk.
    if (id !== null)
      return await Entities.loadEntityById(id, Entity);

    // Otherwise we create a new entity based on
    // root entity with id 'className'.
    return await Entities.createNewPrototypeEntity
    (
      // Root prototype entity uses root entity as it's prototype
      // object and root entities use 'className' as their id.
      className,
      // 'className' will also be the name of this prototype.
      className,
      Entity  // Type cast.
    );

    /// To be deleted.
    ///return await this.createRootPrototypeEntity(className)
  }

  /// To be deleted.
  // // Creates a new prototype entity based on root entity with id 'className'.
  // // Sets 'className' as it's unique name in 'PROTOTYPE' cathegory.
  // // -> Returns 'null' on error.
  // private async createRootPrototypeEntity(className: string)
  // {
  //   // We use 'className' as 'prototypeId', because our prototype
  //   // object will be a root entity which uses 'className' as it's
  //   // id.
  //   return await Entities.createNewPrototypeEntity
  //   (
  //     // Root prototype entity uses root entity as it's prototype
  //     // object and root entities use 'className' as their ids.
  //     className,
  //     // 'className' will also be the name of this prototype.
  //     className
  //   );

  //   /// Tohle teď dělá přímo Entities.createNewPrototypeEntity()
  //   /*
  //   // Note: setName() is an async operation because
  //   //   it creates a name lock file.
  //   let result = await prototypeEntity.setName
  //   (
  //     className,
  //     Entity.NameCathegory.PROTOTYPE
  //   );

  //   if (!result)
  //   {
  //     ERROR("Failed to set name to the new root prototype"
  //       + " entity " + prototypeEntity.getErrorIdString());
  //     // If name coundn't be set to entity, release it from
  //     // Entities (and thus from the memory).
  //     Entities.release(prototypeEntity);
  //     return null;
  //   }

  //   return prototypeEntity;
  //   */
  // }

  // Recursively loads all prototype entities inherited from root
  // entity prototypes.
  private async loadDescendantPrototypes()
  {
    // We iterate 'entityClasses' array instead of this.prototypes,
    // because more items will be added to this.protototypes
    // while recursively loading their descendants.
    for (let className of Classes.entities.keys())
    {
      let prototype = this.prototypes.get(className);

      await this.loadDescendants(prototype);
    }
  }

  // Recursively loads descendant prototypes of 'prototype' entity.
  private async loadDescendants(prototype: Entity)
  {
    for (let descendantId of prototype.getDescendantIds())
    {
      let descendant = await Entities.loadEntityById(descendantId);

      if (descendant === null)
      {
        ERROR("Failed to load prototype entity '" + descendantId + "'");
        continue;
      }

      // Add the desendant to this.prototypes hashmap.
      this.prototypes.set(descendant.className, descendant);

      // Recursively load decendant's descendants.
      await this.loadDescendants(descendant);
    }
  }
}