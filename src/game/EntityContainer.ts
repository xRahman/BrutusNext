/*
  Part of BrutusNEXT

  Adds functionality to all game entities enabling them to contain
  list of ids of other game entities. This is used e. g. for world
  to contain zones, for sectors (or zones) to contain rooms, for
  rooms to contain items and characters, for container objects to
  contain other items, for characters who have inventory to contain
  items.

  When entity containing ids of other entities is loaded or saved,
  it also loads/saves all entities identified by these ids (to ensure
  that we don't e. g. load container but not it's contents).
*/

'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT';
import {GameEntity} from '../game/GameEntity';
import {IdList} from '../game/IdList';
import {Game} from '../game/Game';
import {EntityId} from '../game/EntityId';
import {CommandInterpretter} from '../game/commands/CommandInterpretter';

export abstract class EntityContainer extends CommandInterpretter
{

  // ---------------- Public class data -----------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // When saving an entity, all referenced entities are saved as well.
  // (This way when you save world, everything in it will get saved)
  public async save()
  {
    /// Tady by spravne melo byt super.save(), ale diky bugu v aktualni
    /// verzi v8 enginu nejde pouzit super. uvnitr chainu asyc funkci.
    await this.saveToFile(this.getSaveDirectory(), this.getSaveFileName());

    let contentsArray = this.contents.idArray;

    for (let i = 0; i < contentsArray.length; i++)
    {
      let entityId = contentsArray[i];

      await Game.entities.getItem(entityId).save();
    }
  }

  // When loading an entity, all referenced entities are loaded as well.
  // This is to prevent situation when you e. g. load a conainer but
  // it's contents is not available in the world.
  public async load()
  {
    let filePath = this.getSaveDirectory();
    let fileName = this.getSaveFileName();
    let fullPath = filePath + fileName;

    ASSERT_FATAL(filePath.substr(filePath.length - 1) === '/',
      "filePath '" + filePath + "' doesn't end with '/'");

    /// Tady by spravne melo byt super.load(), ale diky bugu v aktualni
    /// verzi v8 enginu nejde pouzit super. uvnitr chainu asyc funkci.
    // This needs to be done before loading contained entities, because we
    // need to read their id's first.
    await this.loadFromFile(fullPath);

    let contents = this.contents.idArray;

    for (let i = 0; i < contents.length; i++)
    {
      let id = contents[i];

      // If entity already exists, there is no need to load it.
      if (!Game.entities.exists(id))
      {
        // Creates an instance of correct type based on className property
        // of id (in other words: Type of referenced entity is saved within
        // id and is recreated here).
        let newEntity = GameEntity.createInstanceFromId(id);

        // Load entity from file.
        await newEntity.load();

        // Add entity id to it's approptiate manager so it can be searched
        // for by name, etc.
        newEntity.addToManager();
      }
    }
  }

  // -------------- Protected class data ----------------

  // Every game entity can contain other game entities.
  // (Rooms contain characters and objects, bags contain other objects,
  //  sectors contain rooms, etc.)
  protected contents = new IdList();

  // --------------- Protected methods ------------------


  // Adds entity id to contents of this entity.
  protected insertEntity(entityId: EntityId)
  {
    let entity = entityId.getEntity({ typeCast: GameEntity });

    this.contents.addEntityById(entityId);

    entity.setLocation(this.getId());

  }

  // Removes entity if from contents of this entity.
  public removeEntity(entityId: EntityId)
  {
    this.contents.removeEntityFromList(entityId);
  }
}