/*
  Part of BrutusNEXT

  Container storing id's of entities.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Saveable} from '../../../shared/lib/class/Saveable';
import {EntityManager} from '../../../shared/lib/entity/EntityManager';

export class EntityList extends Saveable
{
  //------------------ Private data ---------------------

  // Hashmap<[ string, Entity ]>
  //   Key: string id
  //   Value: entity reference
  // (entries are stored in order of insertion)
  private entities = new Map();

  //// Hashmap<[ string, EntityId ]>
  ////   Key: stringId
  ////   Value: EntityId
  //private uniqueNames = new Map();
  //// Do not save or load property 'uniqueNames'.
  //private static uniqueNames = { isSaved: false };

  // --------------- Public accessors -------------------

  public getEntities() { return this.entities; }

  // Number of entities in the list.
  public get size() { return this.entities.size; }

  // ---------------- Public methods --------------------

  // -> Returns true if adding succeeded.
  public add(entity: Entity): boolean
  {
    let id = entity.getId();

    if (id === null)
    {
      ERROR("Attempt to add entity " + entity.getErrorIdString()
        + " which has 'null' id. Entity is not added");
      return false;
    }

    if (this.entities.has(id))
    {
      ERROR("Attempt to add entity '" + entity.getErrorIdString() + "'"
        + " which is already in the list. Entity is not added");
      return false;
    }

    // Add id to hashmap under it's string id.
    this.entities.set(id, entity);

    return true;
  }

  // Loads all entities of which there are ids in this list.
  public async load(containerIdString: string)
  {
    // Iterate over all values in this.entities hashmap.
    for (let entity of this.entities.values())
    {
      if (entity.isValid())
        // If entity is already loaded, we must not do it again
        // (because we would overwrite more recent data with older version).
        break;

      /// Reference na entitu (tedy proxy handler) nebude trackovat,
      /// ze je entita smazana. Bude to proste invalid reference
      /// a po pripadnem loadnuti z disku to stale bude invalid reference.
      //
      //if (!ASSERT(entity.isDeleted() === false,
      //    "Entity container " + containerIdString + " contains"
      //    + " deleted entity with id " + id.getStringId() + ". Entity"
      //    + " must be removed from its container before it is deleted"))
      //  // There is no point in loading a deleted entity.
      //  break;
      
      await entity.load();
    }
  }

  // Saves all entities of which there are ids in this list.
  public async save()
  {
    // Iterate over all value in this.entityIds hashmap.
    for (let entity of this.entities.values())
    {
      if (entity.isValid() === false)
        // There is no point in saving an entity that is not loaded in memory.
        break;

      await entity.save();
    }
  }

  // Removes entity id from this list, but doesn't delete entity from
  // EntityManager.
  // -> Returns 'true' on success.
  public remove(entity: Entity): boolean
  {
    if (this.entities.has(entity.getId()) === false)
    {
      ERROR("Attempt to remove id '" + entity.getId() + "'"
        + " from '" + this.className + "' that is not present"
        + " in it");
      return false;
    }

    this.entities.delete(entity.getId());

    return true;
  }

  // Removes entity from this list and releases it from memory
  // by removing it from EntityManager (but doesn't delete it from
  // disk).
  public release(entity: Entity)
  {
    // Remove entity from the list.
    if (this.remove(entity))
    {
      // Remove entity reference from id so the memory can be dealocated.
      EntityManager.remove(entity);
    }
  }

  // -> Returns true if entity is in the list.
  public has(entity: Entity): boolean
  {
    return this.entities.has(entity.getId());
  }

  /*
  // -> Returns undefined if entity is not in the list
  public get(id: string): Entity
  {
    return this.entities.get(id);
  }
  */

  // -------------- Private methods -------------------
}