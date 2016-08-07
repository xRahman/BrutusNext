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

    // If entity isn't in global container holding all entities yet, add
    // it there.
    if (!Server.entities.has(id))
    {
      if (entity.getId() === null)
      {
        Server.entities.addUnderNewId(entity);
      }
      else
      {
        Server.entities.addUnderExistingId(entity);
      }
    }

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
      switch (id.getEntityState())
      {
        case EntityId.entityState.UNKNOWN:
          ASSERT(false,
            "Entity container " + containerIdString + " contains"
            + " id " + id.getStringId() + " with unknown entity state."
            + " EntityId must not be accessed before it's entity state is set");
          break;

        case EntityId.entityState.LOADED:
          // If entity is already loaded, there is no need to do it again.
          break;

        case EntityId.entityState.NOT_LOADED:
          await id.loadEntity();
          break;

        case EntityId.entityState.DELETED:
          ASSERT(false,
            "Entity container " + containerIdString + " contains"
            + " deleted entity with id " + id.getStringId() + ". Entity"
            + " must be removed from it's container before it is deleted");
          break;

        default:
          ASSERT(false, "Unknown entity state");
          break;
      }
    }
  }

  // Saves all entities of which there are ids in this list.
  public async save(containerIdString: string)
  {
    // Iterate over all value in this.entityIds hashmap.
    for (let id of this.entityIds.values())
    {
      switch (id.getEntityState())
      {
        case EntityId.entityState.UNKNOWN:
          ASSERT(false,
            "Entity container " + containerIdString + " contains"
            + " id " + id.getStringId() + " with unknown entity state."
            + " EntityId must not be accessed before it's entity state is set");
          break;

        case EntityId.entityState.LOADED:
          await id.saveEntity();
          break;

        case EntityId.entityState.NOT_LOADED:
          // If entity isn't loaded, there is nothing to save.
          break;

        case EntityId.entityState.DELETED:
          ASSERT(false,
            "ContainerEntity " + containerIdString + " contains"
            + " deleted entity with id " + id.getStringId() + ". Entity"
            + " must be removed from it's container before it is deleted");
          break;

        default:
          ASSERT(false, "Unknown entity state");
          break;
      }
    }
  }

  // Removes entity id from this list, but doesn't delete entity from
  // memory.
  public remove(entityId: EntityId)
  {
    if (!ASSERT(this.entityIds.has(entityId.getStringId()),
        "Attempt to remove id '" + entityId.getStringId() + "'"
        + " from IdList '" + this.constructor.name + "'"
        + " that is not present in it"))
      return;

    this.entityIds.delete(entityId.getStringId());
  }

  // Removes entity from this list and deletes it from the game.
  public delete(entityId: EntityId)
  {
    this.remove(entityId);
    Server.entities.dropEntity(entityId);
  }

  // Returns true if entityId is in the list.
  public has(entityId: EntityId): boolean
  {
    return this.entityIds.has(entityId.getStringId());
  }

  // -------------- Private methods -------------------
}