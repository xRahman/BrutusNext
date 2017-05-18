/*
  Part of BrutusNEXT

  Manages prototype entities.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Classes} from '../../../shared/lib/class/Classes';
import {Prototypes} from '../../../shared/lib/entity/Prototypes';
import {Entities} from '../../../shared/lib/entity/Entities';
import {NameLock} from '../../../server/lib/entity/NameLock';
import {Entity} from '../../../shared/lib/entity/Entity';

export class ServerPrototypes extends Prototypes
{
  // Name of the directory in 'data/names' where prototype
  // name lock files are saved.
  private static get PROTOTYPE_NAMES_DIRECTORY() { return 'prototypes'; }

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
      let prototype = await this.initRootPrototype(className);

      if (prototype)
        // Add the prototype entity to this.prototypes hashmap.
        this.prototypes.set(className, prototype);
    }
  }

  // Loads prototype entity 'className' form the disk if it's save
  // exits, creates a new prototype entity otherwise.
  // -> Returns 'null' on error.
  private async initRootPrototype(className: string)
  {
    // We will use result to test if file exist.
    let id = await NameLock.readId
    (
      className,
      ServerPrototypes.PROTOTYPE_NAMES_DIRECTORY,
      false  // Do not log errors.
    );

    if (id !== null)
      return await Entities.loadEntityById(id, Entity);

    return await Entities.createPrototype
    (
      // Root prototypes use root objects as their prototype,
      // which is identified by 'className'.
      className,
      // 'className' will also be the name of this prototype.
      className,
      Entity  // Type cast.
    );
  }

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
      let descendant = await Entities.loadEntityById(descendantId, Entity);

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