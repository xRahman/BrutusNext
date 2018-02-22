/*
  Part of BrutusNEXT

  Adds ability to store unique names and search in them.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Entities} from '../../../shared/lib/entity/Entities';

export class NameList<T extends Entity>
{
  constructor
  (
    // NameLists only accepts entites with this name cathegory.
    private cathegory: Entity.NameCathegory
  )
  {
  }

  // ----------------- Private data ---------------------

  // Key:   entity name
  // Value: entity
  private names = new Map<string, T>();

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -> Returns 'true' on success.
  public add(entity: T): boolean
  {
    let name = entity.getName();
    let cathegory = entity.getNameCathegory();

    if (!name)
    {
      ERROR("Entity " + entity.getErrorIdString()
        + " has invalid or empty name. It is not"
        + " added to NameList");
      return false;
    }

    if (cathegory !== this.cathegory)
    {
      ERROR("Entity " + entity.getErrorIdString() + " has cathegory"
        + " " + Entity.NameCathegory[cathegory] + " which doesn't"
        + " match cathegory " + Entity.NameCathegory[this.cathegory]
        + " required by NameList. Entity is not added");
      return false;
    }

    if (this.names.has(name))
    {
      ERROR("Attempt to add entity " + entity.getErrorIdString()
       + " to NameList which is already there");
      return false;
    }

    this.names.set(name, entity);

    return true;
  }

  // -> Returns 'undefined' if entity 'name' isn't in the list.
  public get(name: string): T | undefined
  {
    return this.names.get(name);
  }

  // Removes entity from this list, but not from memory.
  // -> Returns 'true' on success.
  public remove(entity: T): boolean
  {
    let name = entity.getName();
    let cathegory = entity.getNameCathegory();

    if (!this.names.has(name))
    {
      ERROR("Attempt to remove entity " + entity.getErrorIdString()
       + " from NameList which is not there");
      return false;
    }

    if (!name)
    {
      ERROR("Entity " + entity.getErrorIdString()
        + " has invalid or empty name. It is not"
        + " removed from NameList");
      return false;
    }

    if (cathegory !== this.cathegory)
    {
      // We will report the error but remove the entity from the list
      // anyways.
      ERROR("Entity " + entity.getErrorIdString() + " has cathegory"
        + " " + Entity.NameCathegory[cathegory] + " which doesn't"
        + " match cathegory " + Entity.NameCathegory[this.cathegory]
        + " required by NameList. This probably means that someone"
        + " has changed the cathegory of this entity but didn't"
        + " remove it from this list");
    }

    this.names.delete(name);
  }

  public has(name: string): boolean
  {
    return this.names.has(name);
  }

  // -------------- Private methods -------------------
}