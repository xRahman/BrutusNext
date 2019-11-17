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
        + " added to name list");
      return false;
    }

    if (cathegory === null)
    {
      ERROR("Entity " + entity.getErrorIdString() + " cannot be aded"
        + " to name list because it doesn't have a name cathegory");
      return false;
    }

    if (cathegory !== this.cathegory)
    {
      ERROR("Entity " + entity.getErrorIdString() + " has cathegory"
        + " " + Entity.NameCathegory[cathegory] + " which doesn't"
        + " match cathegory " + Entity.NameCathegory[this.cathegory]
        + " required by name list. Entity is not added");
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

    if (name === null)
    {
      ERROR("Cannot remove entity " + entity.getErrorIdString()
       + " from name list because it doesn't have a name");
      return false;
    }

    if (!this.names.has(name))
    {
      ERROR("Attempt to remove entity " + entity.getErrorIdString()
       + " from name list which is not there");
      return false;
    }

    if (!name)
    {
      ERROR("Entity " + entity.getErrorIdString()
        + " has invalid or empty name. It is not"
        + " removed from name list");
      return false;
    }

    if (cathegory === null)
    {
      // We will report the error but remove the entity from the list
      // anyways.
      ERROR("Attempt to remove entity " + entity.getErrorIdString()
        + " which doesn't have a name cathegory from a name list."
        + " This probably means that someone has changed the cathegory"
        + " of this entity but didn't remove it from this list");
    }
    else if (cathegory !== this.cathegory)
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

    return true;
  }

  public has(name: string): boolean
  {
    return this.names.has(name);
  }

  // -------------- Private methods -------------------
}