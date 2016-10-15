/*
  Part of BrutusNEXT

  Adds ability to store unique names and search in them.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {NamedEntity} from '../../shared/entity/NamedEntity';
import {EntityList} from '../../shared/entity/EntityList';
import {Entity} from '../../shared/entity/Entity';

export class NameSearchList extends EntityList
{
  //------------------ Private data ---------------------

  // Hashmap<[ string, Entity ]>
  //   Key: string id
  //   Value: entity reference
  private uniqueNames = new Map();
  // Do not save or load property 'uniqueNames'.
  private static uniqueNames = { isSaved: false };

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -> Returns true if adding succeeded.
  public add(entity: NamedEntity): boolean
  {
    // Try to add an entity to the list using our ancestor's add() method.
    if (super.add(entity) === null)
      return false;

    // If entity has unique name, add it's id to the hashmap of unique names.
    if (entity.isNameUnique)
      this.uniqueNames.set(entity.name, entity);

    return true;
  }

  // Only checks entities with unique names.
  // -> Returns undefined if entity isn't loaded or doesn't exist.
  public getEntityByName(name: string)
  {
    return this.uniqueNames.get(name);
  }

  // Removes entity id from this list, but doesn't delete entity from
  // memory.
  public remove(entity: NamedEntity): boolean
  {
    if (entity.isNameUnique)
    {
      if (entity.name !== undefined)
      {
        // Remove record from hashmap storing ids of uniquely named entities.
        this.uniqueNames.delete(entity.name);
      }
      else
      {
        ERROR("Unable to remove entity " + entity.getErrorIdString()
          + " from NameSearchList because it doesn't have a 'name' property");
      }
    }

    return super.remove(entity);
  }

  public hasUniqueEntity(name: string): boolean
  {
    return this.uniqueNames.has(name);
  }

  // -------------- Private methods -------------------
}