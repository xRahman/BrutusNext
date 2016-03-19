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

//import {ASSERT} from '../shared/ASSERT';
//import {Server} from '../server/Server';
import {Id} from '../shared/Id';
import {SaveableArray} from '../shared/SaveableArray';
import {GameEntity} from '../game/GameEntity';
import {EntityIdManager} from '../game/EntityIdManager';
//import {Game} from '../game/Game';
import {CommandInterpretter} from '../game/commands/CommandInterpretter';

export abstract class EntityContainer extends CommandInterpretter
{

  // ---------------- Public class data -----------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -------------- Protected class data ----------------

  // Every game entity can contain other game entities.
  // (Rooms contain characters and objects, bags contain other objects,
  //  sectors contain rooms, etc.)
  ///protected myEntityIds = new SaveableArray<Id>(Id);
  protected myEntityIdManager = new EntityIdManager<GameEntity>();

  // --------------- Protected methods ------------------


  // Adds entity id to contents of this entity.
  protected addEntity(entityId: Id)
  {
    /// TODO: Asi to přidat taky do abbrevSearchListu této
    /// entity (možná do více abrevSearchListů, pokud může
    /// být v contents víc druhů entity, třeba objekty a charaktery
    /// v Roomu).

    //this.myEntityIds.push(entityId);
    /// TODO: Mozna neco jako registerEntityById(id); ?
    ///this.myEntityIdManager.registerEntity();
  }

  /*
  // This terrible hack is needed to bypass bug in current version of
  // TypeScript (at the time of writing this code), which disallows using
  // super. call within nested async method.
  protected async superLoadFromFileHack(filePath: string)
  {
    super.loadFromFile(filePath);
  }

  // Override ancestor's loadFromFile() in order to load entities contained
  // in this entity.
  protected async loadFromFile(filePath: string)
  {
    // First we need to load our own (sector) data, so we know
    // which entity ids do we contain.
    ///await super.loadFromFile(filePath);
    await this.superLoadFromFileHack(filePath);

    // We only hold ids of cotained entities, not actual entities. So we need
    // to load them manually.
    for (let i = 0; i < this.myEntityIds.length; i++)
    {
      let id = this.myEntityIds[i];

      // If entity already exists, there is no need to load it.
      if (!Game.entities.exists(id))
      {
        let newEntity = GameEntity.createInstance(id);

        // Load entity from file.
        await newEntity.load();

        // Add entity id to it's approptiate manager so it can be searched for by
        // name, etc.
        newEntity.addToManager();
      }
    }
  }

  // This terrible hack is needed to bypass bug in current version of
  // TypeScript (at the time of writing this code), which disallows using
  // super. call within nested async method.
  protected async superSaveToFileHack(filePath: string)
  {
    super.saveToFile(filePath);
  }

  // Override ancestor's saveToFile() in order to save entities contained
  // in this entity.
  protected async saveToFile(filePath: string)
  {
    // We only hold ids of cotained entities, not actual entities. So we need
    // to save them manually.
    for (let i = 0; i < this.myEntityIds.length; i++)
    {
      let entityId = this.myEntityIds[i];

      await Game.entities.getItem(entityId).save();
    }

    ///await super.saveToFile(filePath);
    await this.superSaveToFileHack(filePath);
  }
  */
}