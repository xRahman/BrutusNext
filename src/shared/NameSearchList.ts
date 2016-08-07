/*
  Part of BrutusNEXT

  Adds ability to store unique names and search in them.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
//import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {NamedEntity} from '../shared/NamedEntity';
import {IdList} from '../shared/IdList';
import {EntityId} from '../shared/EntityId';
//import {SaveableObject} from '../shared/SaveableObject';
//import {Server} from '../server/Server';

export class NameSearchList extends IdList
{
  // -------------- Private class data ----------------

  // Hashmap<[ string, EntityId ]>
  //   Key: stringId
  //   Value: EntityId
  private uniqueNames = new Map();
  // Do not save or load property 'uniqueNames'.
  private static uniqueNames = { isSaved: false };

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public add(entity: NamedEntity): EntityId
  {
    let id = super.add(entity);

    if (id === null)
      return null;

    // If entity has unique name, add it's id to the hashmap of unique names.
    if (entity.isNameUnique)
    {
      this.uniqueNames.set(entity.name, id);
    }

    return id;
  }

  // Returns null if entity isn't loaded (or doesn't exist).
  // Only checks entities with unique names.
  public getIdByName(name: string): EntityId
  {
    let id = this.uniqueNames.get(name);

    if (id !== undefined)
    {
      return id;
    }

    return null;
  }

  // Removes entity id from this list, but doesn't delete entity from
  // memory.
  public remove(entityId: EntityId)
  {
    let entity = entityId.getEntity({ typeCast: NamedEntity });

    if (entity === null)
      return;

    if (entity.isNameUnique)
    {
      if (ASSERT(entity.name !== undefined,
        "'name' property doesn't exist."))
      {
        // Remove record from hashmap storing ids of uniquely named entities.
        delete this.uniqueNames[entity.name];
      }
    }

    super.remove(entityId);
  }

  public hasUniqueEntity(name: string): boolean
  {
    return this.uniqueNames.has(name);
  }

  // -------------- Private methods -------------------
}