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
  //   Creates root prototype entities if they don't exist yet or
  // loads them from disk. Then recursively loads all prototype entities
  // inherited from them.
  public async initPrototypes(entityClasses: Array<string>)
  {
    await this.initPrototypes(entityClasses);

    await this.loadDescendantPrototypes();
  }

  // Creates root prototype entities if they don't exist yet or
  // loads them from disk.
  private initRootPrototypes(entityClasses: Array<string>)
  {
    let prototypeEntity = null;

    for (let className of entityClasses)
    {
      // Check if entity 'className' exists (check if such
      /// nameLockFile exists).
      let saveExists = FileManager.doesNameLockFileExist
      (
        className,
        Entity.NameCathegory.PROTOTYPE
      );

      if (saveExists)
      {
        /// TODO: Load it from file if save does exist.
      }
      else
      {
        // Create new entity based on root entity 'className'
        // if save doesn't exist.
        /// TODO: Rozlisit vytvareni nove entity (generovani idcka)
        ///  a vytvareni instance existujici entity (pouziti existujiciho
        ///  idcka). Mozna by to vyresil default parametr id = null.
        EntityManager.createPrototype(className, )
      }


      // Add the prototype entity to this.prototypes hashmap.
      this.prototypes.set(className, prototypeEntity);
    }
  }

  // Recursively loads all prototype entities inherited from root
  // prototypes.
  private async loadDescendantPrototypes()
  {
    /// TODO: Recursively load descendantPrototypes of all
    /// root prototypes.
  }
}