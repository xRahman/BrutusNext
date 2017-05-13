/*
  Part of BrutusNEXT

  Manages prototype entities.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {ClassFactory} from '../../../shared/lib/class/ClassFactory';
import {PrototypeManager} from '../../../shared/lib/entity/PrototypeManager';
import {EntityManager} from '../../../shared/lib/entity/EntityManager';
import {FileManager} from '../../../server/lib/fs/FileManager';
import {Entity} from '../../../shared/lib/entity/Entity';

export class ServerPrototypeManager extends PrototypeManager
{
  // ---------------- Public methods --------------------

  // ~ Overrides PrototypeManager.initPrototypes().
  // Creates root prototype entities if they don't exist on
  // the disk or loads them if they do. Then recursively loads
  // all prototype entities inherited from them.
  public async initPrototypes()
  {
    let entityClasses = ClassFactory.getListOfEntityClasses();

    await this.initRootPrototypes(entityClasses);
    await this.loadDescendantPrototypes(entityClasses);
  }

  // --------------- Private methods -------------------- 

  // Creates root prototype entities if they don't exist yet or
  // loads them from disk.
  private async initRootPrototypes(entityClasses: Array<string>)
  {
    for (let className of entityClasses)
    {
      let prototypeEntity = await this.initRootPrototypeEntity(className);

      if (!prototypeEntity)
        continue;

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
      false  // Do not report errors (like when file doesn't exist).
    );

    // If name lock file exists, we use the id
    // loaded from it to load prototype entity
    // from disk.
    if (id !== null)
      return await EntityManager.loadEntityById(id);

    // Otherwise we create a new entity based on
    // root entity with id 'className'.
    return await EntityManager.createNewPrototypeEntity
    (
      // Root prototype entity uses root entity as it's prototype
      // object and root entities use 'className' as their id.
      className,
      // 'className' will also be the name of this prototype.
      className
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
  //   return await EntityManager.createNewPrototypeEntity
  //   (
  //     // Root prototype entity uses root entity as it's prototype
  //     // object and root entities use 'className' as their ids.
  //     className,
  //     // 'className' will also be the name of this prototype.
  //     className
  //   );

  //   /// Tohle teď dělá přímo EntityManager.createNewPrototypeEntity()
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
  //     // EntityManager (and thus from the memory).
  //     EntityManager.release(prototypeEntity);
  //     return null;
  //   }

  //   return prototypeEntity;
  //   */
  // }

  // Recursively loads all prototype entities inherited from root
  // entity prototypes.
  private async loadDescendantPrototypes(entityClasses: Array<string>)
  {
    // We iterate 'entityClasses' array instead of this.prototypes,
    // because more items will be added to this.protototypes
    // while recursively loading their descendants.
    for (let className of entityClasses)
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
      let descendant = await EntityManager.loadEntityById(descendantId);

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