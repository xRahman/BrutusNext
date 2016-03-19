/*
  Part of BrutusNEXT

  Abstract ancestor for all game entities (rooms, items, characters, etc.).
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {Server} from '../server/Server';
import {Id} from '../shared/Id';
import {SaveableArray} from '../shared/SaveableArray';
import {Game} from '../game/Game';
import {CommandInterpretter} from '../game/CommandInterpretter';

export abstract class GameEntity extends CommandInterpretter
{
  constructor(public name: string)
  {
    super();
  }

  static get SAVE_DIRECTORY()
  {
    ASSERT(false,
      "Attempt to access SAVE_DIRECTORY of abstract GameEntity class");

    return "";
  }

  // Creates a new instance of game entity of type saved in id.
  static createInstance(id: Id)
  {
    /// Tohle snad vyrobi instanci typu podle stringu id.className.
    /// global by mel byt namespace - hadam, ze to bude 'global' object
    /// z node.js.
    /// Přetypování na <GameEntity> je tu proto, aby typescript aspoň zhruba
    /// věděl, co od toho může očekávat - jinak by to byl typ <any>.
    let newEntity = <GameEntity> new global[id.className]();

    return newEntity;
  }

  // ---------------- Public class data -----------------

  public hasUniqueName = false;

  // --------------- Public accessors -------------------

  public get playerConnection()
  {
    // We need to return null if myPlayerConnectionId is null, because
    // if accessing playerConnection when myPlayerConnectionId is null
    // was considered an error, saving game entity with null id would crash
    // (even if id is not actually saved, crash would occur on attempt
    // to find out if playerConnection property is SaveableObject).
    //    It's proabably better to be able to check playerConnection to
    // be null anyways, because it's intuitive way to do it (instead of
    // having to check if myPlayerConnectionId is null).
    if (this.myPlayerConnectionId.isNull())
      return null;

    return Server.playerConnectionManager
      .getPlayerConnection(this.myPlayerConnectionId);
  }

  public set playerConnectionId(value: Id)
  {
    this.myPlayerConnectionId = value;
  }

  // ---------------- Public methods --------------------

  // Player connected to this entity is entering game.
  //   Needs to be overriden if something is going to happen (like message
  // that a player character has just entered game).
  public announcePlayerEnteringGame() { }

  // Player connected to this entity has reconnected.
  //   Needs to be overriden if something is going to happen (like message
  // that a player character has just entered game).
  public announcePlayerReconnecting() { }

  // -------------- Protected class data ----------------

  // Id.NULL if no player is connected to (is playing as) this entity,
  // connectionId otherwise.
  protected myPlayerConnectionId: Id = Id.NULL;

  // Every game entity can contain other game entities.
  // (Rooms contain characters and objects, bags contain other objects,
  //  sectors contain rooms, etc.)
  protected myEntityIds = new SaveableArray<Id>(Id);

  // --------------- Protected methods ------------------

  // Send message to the connected player that command is not recognized.
  protected unknownCommand()
  {
    if (this.myPlayerConnectionId)
      this.playerConnection.send("&gHuh?!?");
  }

  // Entity adds itself to approptiate manager
  // (so it can be searched by name, etc.)
  protected addToManager() { }

  // Adds entity id to contents of this entity.
  protected addEntity(entityId: Id)
  {
    /// TODO: Asi to přidat taky do abbrevSearchListu této
    /// entity (možná do více abrevSearchListů, pokud může
    /// být v contents víc druhů entity, třeba objekty a charaktery
    /// v Roomu).

    this.myEntityIds.push(entityId);
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