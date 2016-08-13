/*
  Part of BrutusNEXT

  Container storing id's of entities.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {Entity} from '../shared/Entity';
import {EntityId} from '../shared/EntityId';
import {SaveableObject} from '../shared/SaveableObject';
import {Server} from '../server/Server';

export class IdList extends SaveableObject
{
  // -------------- Private class data ----------------

  // Hashmap<[ string, EntityId ]>
  //   Key: stringId
  //   Value: EntityId
  // (entries are stored in order of insertion)
  private entityIds = new Map();

  //// Hashmap<[ string, EntityId ]>
  ////   Key: stringId
  ////   Value: EntityId
  //private uniqueNames = new Map();
  //// Do not save or load property 'uniqueNames'.
  //private static uniqueNames = { isSaved: false };

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public add(entity: Entity): EntityId
  {
    let id = entity.getId();

    if (!ASSERT(id !== null,
        "Attempt to add entity " + entity.getErrorIdString()
        + " which has 'null' id. Entity is not added to id list"))
      return null;

    if (!ASSERT(!this.entityIds.has(id),
        "Attempt to add entity '" + entity.getErrorIdString() + "'"
        + " which is already in the list. Entity is not added"))
      return null;

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
    this.entityIds.set(id.getStringId, id);

    return id;
  }

  // Loads all entities of which there are ids in this list.
  public async load(containerIdString: string)
  {
    // Iterate over all value in this.entityIds hashmap.
    for (let id of this.entityIds.values())
    {
      // Valid means loaded in memory and not flagged as delted.
      if (id.isEntityValid())
        // If entity is already loaded, we must not do it again
        // (because we would overwrite more recent data with older version).
        break;

      if (!ASSERT(id.isEntityDeleted() === false,
          "Entity container " + containerIdString + " contains"
          + " deleted entity with id " + id.getStringId() + ". Entity"
          + " must be removed from its container before it is deleted"))
        // There is no point in loading a deleted entity.
        break;
      
      await id.loadEntity();
    }
  }

  // Saves all entities of which there are ids in this list.
  public async save(containerIdString: string)
  {
    // Iterate over all value in this.entityIds hashmap.
    for (let id of this.entityIds.values())
    {
      if (!ASSERT(id.isEntityDeleted() === false,
          "ContainerEntity " + containerIdString + " contains"
          + " deleted entity with id " + id.getStringId() + ". Entity"
          + " must be removed from its container before it is deleted"))
        // There is no point in saving a deleted entity.
        break;

      // Valid means loaded in memory and not flagged as delted.
      if (id.isEntityValid() === false)
        // There is no point in saving an entity that is not loaded in memory.
        break;

      await id.saveEntity();
    }
  }

  // Removes entity id from this list, but doesn't delete entity from
  // memory.
  public remove(entityId: EntityId)
  {
    if (!ASSERT(this.entityIds.has(entityId.getStringId()),
        "Attempt to remove id '" + entityId.getStringId() + "'"
        + " from IdList '" + this.className + "'"
        + " that is not present in it"))
      return;

    this.entityIds.delete(entityId.getStringId());
  }

  // Removes entity from this list and deletes it from memory.
  public delete(entityId: EntityId)
  {
    // Remove entity reference from id so the memory can be dealocated.
    entityId.dropEntity();

    // Remove id from idList.
    this.remove(entityId);
  }

  // Returns true if entityId is in the list.
  public has(entityId: EntityId): boolean
  {
    return this.entityIds.has(entityId.getStringId());
  }

  // -------------- Private methods -------------------
}