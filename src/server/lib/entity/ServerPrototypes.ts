/*
  Part of BrutusNEXT

  Manages prototype entities.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Classes} from '../../../shared/lib/class/Classes';
import {Prototypes} from '../../../shared/lib/entity/Prototypes';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {NameLock} from '../../../server/lib/entity/NameLock';
import {Entity} from '../../../shared/lib/entity/Entity';

export class ServerPrototypes extends Prototypes
{
  // Name of directory in 'data/names' where prototype
  // name lock files are saved.
  public static get PROTOTYPE_NAMES_DIRECTORY() { return 'prototypes'; }

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
      {
        // Add the prototype entity to this.prototypes hashmap.
        this.prototypeList.set(className, prototype);
      }
    }
  }

  // Loads prototype entity 'className' form the disk if it's save
  // exits, creates a new prototype entity otherwise.
  // -> Returns 'null' on error.
  private async initRootPrototype(className: string)
  {
    // We are going to use the result to test if file exist.
    let id = await NameLock.readId
    (
      className,
      ServerPrototypes.PROTOTYPE_NAMES_DIRECTORY,
      false  // Do not log errors.
    );

    if (id)
      return await ServerEntities.loadRootPrototypeById(id, className);

    return await ServerEntities.createRootPrototype(className);
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
      let prototype = this.prototypeList.get(className);

      await this.loadDescendants(prototype);
    }
  }

  // Recursively loads descendant prototypes of 'prototype' entity.
  private async loadDescendants(prototype: Entity)
  {
    if (!prototype)
    {
      ERROR("Invalid 'prototype', descendants are not loaded");
      return;
    }

    for (let descendantId of prototype.getDescendantIds())
    {
      let descendant = await ServerEntities.loadEntityById
      (
        descendantId,
        Entity
      );

      if (descendant === null)
      {
        ERROR("Failed to load prototype entity '" + descendantId + "'");
        continue;
      }

      // Add the desendant to this.prototypes hashmap.
      this.prototypeList.set(descendant.prototypeName, descendant);

      // Recursively load decendant's descendants.
      await this.loadDescendants(descendant);
    }
  }
}