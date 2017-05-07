/*
  Part of BrutusNEXT

  Manages prototype entities.
*/

'use strict';

import {PrototypeManager} from '../../../shared/lib/entity/PrototypeManager';
import {EntityManager} from '../../../shared/lib/entity/EntityManager';
import {FileManager} from '../../../server/lib/fs/FileManager';
import {Entity} from '../../../shared/lib/entity/Entity';

export class ServerPrototypeManager extends PrototypeManager
{
  // Overrides PrototypeManager.initPrototypes().
  //   Creates root prototype entities if they don't exist on
  // the disk or loads them if they do. Then recursively loads
  // all prototype entities inherited from them.
  public async initPrototypes(entityClasses: Array<string>)
  {
    await this.initRootPrototypes(entityClasses);
    await this.loadDescendantPrototypes();
  }

  // Creates root prototype entities if they don't exist yet or
  // loads them from disk.
  private async initRootPrototypes(entityClasses: Array<string>)
  {
    for (let className of entityClasses)
    {
      let prototypeEntity = await this.initPrototypeEntity(className);

      // Add the prototype entity to this.prototypes hashmap.
      this.prototypes.set(className, prototypeEntity);
    }
  }

  // Loads prototype entity 'className' form the disk if it's save
  // exits, creates a new prototype entity otherwise.
  private async initPrototypeEntity(className: string)
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
      return await Entity.loadById(id);

    // Otherwise we create a new entity based on
    // root entity with id 'className'.
    return await this.createPrototypeEntity(className)
  }

  // Creates a new prototype entity based on root entity with id 'className'.
  // Sets 'className' as it's unique name in 'PROTOTYPE' cathegory.
  private async createPrototypeEntity(className: string)
  {
    let prototypeEntity = EntityManager.createPrototype(className);

    // Note: setName() is an async operation because
    //   it creates a name lock file.
    await prototypeEntity.setName
    (
      className,
      Entity.NameCathegory.PROTOTYPE
    );

    return prototypeEntity;
  }

  // Recursively loads all prototype entities inherited from root
  // prototypes.
  private async loadDescendantPrototypes()
  {
    /// TODO: Recursively load descendantPrototypes of all
    /// root prototypes.
  }
}