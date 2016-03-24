/*
  Part of BrutusNEXT

  Abstract ancestor for all game entities (rooms, items, characters, etc.).
*/

'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT';
import {Server} from '../server/Server';
import {Id} from '../shared/Id';
import {SaveableArray} from '../shared/SaveableArray';
import {Game} from '../game/Game';
import {EntityContainer} from '../game/EntityContainer';

export abstract class GameEntity extends EntityContainer
{
  constructor(public name: string)
  {
    super();
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

  public isNameUnique = false;

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
    if (this.myTmpData.playerConnectionId.isNull())
      return null;

    return Server.playerConnectionManager
      .getPlayerConnection(this.myTmpData.playerConnectionId);
  }

  public set playerConnectionId(value: Id)
  {
    this.myTmpData.playerConnectionId = value;
  }

  // -------------- Protected accessors -----------------

  protected get SAVE_DIRECTORY()
  {
    ASSERT_FATAL(false,
      "Attempt to access SAVE_DIRECTORY of abstract GameEntity class");

    return "";
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

  // Entity adds itself to approptiate manager
  // (so it can be searched by name, etc.)
  public addToManager() { }

  protected getSaveDirectory(): string
  {
    if (this.isNameUnique)
      return this.SAVE_DIRECTORY + "unique/";
    else
      return this.SAVE_DIRECTORY;
  }

  protected getSaveFileName(): string
  {
    if (this.isNameUnique)
      return this.name + ".json";
    else
      return this.getIdStringValue() + ".json";
  }

  // -------------- Protected class data ----------------

  protected myTmpData = new GameEntityTmpData();

  // --------------- Protected methods ------------------

  // Send message to the connected player that command is not recognized.
  protected unknownCommand()
  {
    if (this.playerConnection)
      this.playerConnection.send("&gHuh?!?");
  }
}

// ---------------------- private module stuff -------------------------------

// Auxiliary class storing temporary data that should not be saved.
class GameEntityTmpData
{
  // Id.NULL if no player is connected to (is playing as) this entity,
  // connectionId otherwise.
  public playerConnectionId: Id = Id.NULL;
}