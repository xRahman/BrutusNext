/*
  Part of BrutusNEXT

  Container storing id's of entities.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {Entity} from '../shared/Entity';
///import {EntityId} from '../shared/EntityId';
import {SaveableObject} from '../shared/SaveableObject';
import {Server} from '../server/Server';

export class EntityList extends SaveableObject
{
  // -------------- Private class data ----------------

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

  // ---------------- Public methods --------------------

  // -> Returns true if adding succeeded.
  public add(entity: Entity): boolean
  {
    let id = entity.getId();

    if (!ASSERT(id !== null,
        "Attempt to add entity " + entity.getErrorIdString()
        + " which has 'null' id. Entity is not added"))
      return false;

    if (!ASSERT(!this.entities.has(id),
        "Attempt to add entity '" + entity.getErrorIdString() + "'"
        + " which is already in the list. Entity is not added"))
      return false;

    /// Entity is now stored directly in an id.
    /*
    // If entity isn't in global container holding all entities yet, add
    // it there.
    if (!Server.idManager.hasEntity(id))
    {
      if (entity.getId() === null)
      {
        Server.idManager.addUnderNewId(entity);
      }
      else
      {
        Server.idManager.addUnderExistingId(entity);
      }
    }
    */

    // Add id to hashmap under it's string id.
    this.entities.set(id, entity);

    return true;
  }

  // Loads all entities of which there are ids in this list.
  public async load(containerIdString: string)
  {
    // Iterate over all value in this.entityIds hashmap.
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
  public async save(containerIdString: string)
  {
    // Iterate over all value in this.entityIds hashmap.
    for (let entity of this.entities.values())
    {
      /// Reference na entitu (tedy proxy handler) nebude trackovat,
      /// ze je entita smazana. Bude to proste invalid reference
      /// a po pripadnem loadnuti z disku to stale bude invalid reference.
      //
      //if (!ASSERT(id.isEntityDeleted() === false,
      //    "ContainerEntity " + containerIdString + " contains"
      //    + " deleted entity with id " + id.getStringId() + ". Entity"
      //    + " must be removed from its container before it is deleted"))
      //  // There is no point in saving a deleted entity.
      //  break;

      if (entity.isValid() === false)
        // There is no point in saving an entity that is not loaded in memory.
        break;

      await entity.save();
    }
  }

  // Removes entity id from this list, but doesn't delete entity from
  // EntityManager.
  // -> Returns true if deletion succeeded.
  public remove(entity: Entity): boolean
  {
    if (!ASSERT(this.entities.has(entity.getId()),
        "Attempt to remove id '" + entity.getId() + "'"
        + " from EntityList '" + this.className + "'"
        + " that is not present in it"))
      return false;

    this.entities.delete(entity.getId());

    return true;
  }

  // Removes entity from this list and deletes it from memory.
  public delete(entity: Entity)
  {
    // Remove entity from the list.
    if (this.remove(entity))
    {
      // Remove entity reference from id so the memory can be dealocated.
      Server.entityManager.remove(entity);
    }
  }

  // -> Returns true if entity is in the list.
  public has(entity: Entity): boolean
  {
    return this.entities.has(entity.getId());
  }

  // -------------- Private methods -------------------
}