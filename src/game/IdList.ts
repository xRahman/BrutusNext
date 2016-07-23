/*
  Part of BrutusNEXT

  Managers storing id's of game entities.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {EntityId} from '../game/EntityId';
import {SaveableObject} from '../shared/SaveableObject';
import {AbbrevSearchList} from '../game/AbbrevSearchList';
import {Game} from '../game/Game';
import {GameEntity} from '../game/GameEntity';

export class IdList extends SaveableObject
{
  // --------------- Public accessors -------------------

  public get idArray() { return this.entityIds; }

  // ---------------- Public methods --------------------

  // Returns null if entity isn't loaded (or doesn't exist).
  // Only checks entities with unique names.
  public getUniqueEntityByName(name: string): GameEntity
  {
    if (name in this.uniqueNames)
    {
      // Entity is already loaded.
      let entityId = this.uniqueNames[name];

      return Game.entities.getItem(entityId);
    }

    return null;
  }

  public addEntityById(entityId: EntityId)
  {
    this.addEntityUnderExistingId(Game.entities.getItem(entityId));
  }

  // Adds entity that has been loaded from file to the list of
  // entities under it's original id (that was loaded from file).
  public addEntityUnderExistingId(entity: GameEntity)
  {
    if (entity.isNameUnique)
    {
      ASSERT(entity.name !== undefined, "'name' property doesn't exist.");

      ASSERT_FATAL(!this.getUniqueEntityByName(entity.name),
        "Attempt to register entity '"
        + entity.name + "' that is already registered");
    }

    this.addEntity(entity);
  }

  public addEntityUnderNewId(entity: GameEntity): EntityId
  {
    let newId = Game.entities.addItemUnderNewId(entity);

    this.addEntity(entity);

    return <EntityId>newId;
  }

  // Removes entity id from this list, but doesn't delete the entity from
  // the game.
  public removeEntityFromList(entityId: EntityId)
  {
    let entity = Game.entities.getItem(entityId);

    if (entity.isNameUnique)
    {
      ASSERT(entity.name !== undefined, "'name' property doesn't exist.");

      // Also remove record to the corresponding hashmap storing uniquely named
      // entities.
      delete this.uniqueNames[entity.name];
    }
   
    // Remove all aliases of this entity from abbrevSearchList.
    this.abbrevSearchList.removeEntity(entity);

    // And remove id from array of ids contained in the list.
    let index = this.entityIds.indexOf(entityId);

    if (!ASSERT(index !== -1,
        "Attempt to remove id of entity '" + entity.name + "' from"
        + " IdList which is not present in it"))
      return;

    // splice() removes 1 item at the position 'index'.
    this.entityIds.splice(index, 1);
  }

  // Removes entity from this list and deletes it from the game.
  public deleteEntity(entityId: EntityId)
  {
    this.removeEntityFromList(entityId);
    Game.entities.removeItem(entityId);
  }

  public hasUniqueEntity(name: string): boolean
  {
    if (this.uniqueNames[name])
      return true;

    return false;
  }

  public isInTheList(entityId: EntityId): boolean
  {
    if (this.entityIds.indexOf(entityId) === -1)
      return false;
    else
      return true;
  }

  // -------------- Private class data ----------------

  private abbrevSearchList = new AbbrevSearchList();
  // Flag saying that abbrevSearchList is not to be saved to JSON.
  private static abbrevSearchList = { isSaved: false };
 
  // We need array because order is important
  // (e.g.order of contents in a room).
  private entityIds = new Array<EntityId>();

  // Hashmap mapping strings (names) to ids.
  private uniqueNames: { [key: string]: EntityId } = {};
  // Flag saying that uniqueNames is not to be saved to JSON.
  private static uniqueNames = { isSaved: false };

  // -------------- Private methods -------------------  

  private addEntity(entity: GameEntity)
  {
    if (!ASSERT(!this.isInTheList(entity.getId()),
        "Attempt to add entity '" + entity.name + "' to an id list"
        + " which is already present in it"))
      return;

    // If entity isn't in global container holding all entities yet, add
    // it there.
    if (!Game.entities.exists(entity.getId()))
    {
      if (entity.getId() === null)
        Game.entities.addItemUnderNewId(entity);
      else
        Game.entities.addItemUnderExistingId(entity);
    }

    // Add to the list of entities contained in this list.
    this.entityIds.push(entity.getId());

    // If entity has unique name, add it's id to the hashmap of unique names.
    if (entity.isNameUnique)
    {
      this.uniqueNames[entity.name] = entity.getId();
    }

    // Add all aliases of this entity to abbrevSearchList.
    this.abbrevSearchList.addEntity(entity);
  }
}