/*
  Part of BrutusNEXT

  Abstract ancestor for all game entities (rooms, items, characters, etc.).
*/

'use strict';

import {ASSERT_FATAL} from '../shared/ASSERT';
import {Server} from '../server/Server';
import {Id} from '../shared/Id';
import {SaveableObject} from '../shared/SaveableObject';
import {Game} from '../game/Game';
import {EntityContainer} from '../game/EntityContainer';

export abstract class GameEntity extends EntityContainer
{
  // If you were wondering why 'name' isn't passed to constructor,
  // it's because of dynamic instantiation while loading from file.
  // While it's possible to pass arguments to dynamically called
  // constructor, it would be difficult to pass it a name before
  // anything was actually loaded yet.
  constructor()
  {
    super();
  }

  // Creates a new instance of game entity of type saved in id.
  static createInstanceFromId(id: Id, ...args: any[])
  {
    ASSERT_FATAL(id !== null,
      "Invalid (null) id passed to GameEntity::createInstance()");

    let newEntity =
      <GameEntity>SaveableObject.createInstance(id.getType(), args);

    newEntity.id = id;
    
    return <GameEntity>newEntity;
  }

  /*
  // Creates a new instance of game entity of type saved in id.
  static createInstance(id: Id, ...args: any[])
  {
    // Here we are going to create an instance of a class with a name
    // stored within id as id.getType().
    // We will use global object to acces respective class constructor.

    ASSERT_FATAL(id !== null,
      "Invalid (null) id passed to GameEntity::createInstance()");

    ASSERT_FATAL(typeof id.getType() !== 'undefined' && id.getType() !== "",
      "Id with invalid class type passed to GameEntity::createInstance()");

    ASSERT_FATAL(typeof global[id.getType()] !== 'undefined',
      "Attempt to createInstance() of unknown type '" + id.getType() + "'."
      + " You probably forgot to add something like"
      + " 'global['Character'] = Character;' at the end of your newly"
      + " created module.")

    // Type cast to <GameEntity> is here for TypeScript to be roughly aware
    // what can it expect from newly created variable - otherwise it would
    // be of type <any>.
    let newEntity = <GameEntity>new global[id.getType()](...args);

    newEntity.id = id;

    return newEntity;
  }
  */

  // ---------------- Public class data -----------------

  public name = "Unnamed Entity";
  public isNameUnique = false;

  // --------------- Public accessors -------------------

  public get playerConnection()
  {
    // We need to return null if playerConnectionId is null, because
    // if accessing playerConnection when playerConnectionId is null
    // was considered an error, saving game entity with null id would crash
    // (even if id is not actually saved, crash would occur on attempt
    // to find out if playerConnection property is SaveableObject).
    //    It's proabably better to be able to check playerConnection to
    // be null anyways, because it's intuitive way to do it (instead of
    // having to check if playerConnectionId is null).
    if (this.tmpData.playerConnectionId === null)
      return null;

    return Server.playerConnectionManager
      .getPlayerConnection(this.tmpData.playerConnectionId);
  }

  public set playerConnectionId(value: Id)
  {
    this.tmpData.playerConnectionId = value;
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

  // Player connected to this entity is entering game.
  //   Needs to be overriden if something is going to happen (like message
  // that a player character has just entered game).
  public announcePlayerLeavingGame() { }

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

  protected tmpData = new GameEntityTmpData();

  // --------------- Protected methods ------------------

  // Send message to the connected player that command is not recognized.
  protected unknownCommand()
  {
    if (this.playerConnection)
      this.playerConnection.send("&gHuh?!?");
  }

  // ---------------- Command handlers ------------------

  // Prevents accidental quitting without typing full 'quit' commmand.s
  protected doQui(argument: string)
  {
    if (this.playerConnection)
    {
      this.playerConnection.send("&gYou have to type quit--no less, to quit!");
    }
  }

  protected doQuit(argument: string)
  {
    if (this.playerConnection)
    {
      this.announcePlayerLeavingGame();
      this.playerConnection.send("&gGoodbye, friend.. Come back soon!\r\n");
      this.playerConnection.enterLobby();
      this.playerConnection.detachFromGameEntity();
    }
  }
}

// ---------------------- private module stuff -------------------------------

// Auxiliary class storing temporary data that should not be saved.
class GameEntityTmpData
{
  // null if no player is connected to (is playing as) this entity,
  // connectionId otherwise.
  public playerConnectionId: Id = null;
}