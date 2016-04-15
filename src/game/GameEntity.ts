/*
  Part of BrutusNEXT

  Abstract ancestor for all game entities (rooms, items, characters, etc.).
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Server} from '../server/Server';
import {Id} from '../shared/Id';
import {SaveableObject} from '../shared/SaveableObject';
import {Game} from '../game/Game';
import {EntityContainer} from '../game/EntityContainer';

export abstract class GameEntity extends EntityContainer
{
  /*
  /// TEST

  protected testVariable = "Hello World!";
  protected static testVariable = { isSaved: false };
  protected static testStaticVariable = "GameEntityStaticVariable";
  //public test() { console.log("GameEntity::" + this.className); }
  public test()
  {
    console.log("GameEntity::" + GameEntity['testStaticVariable']);
  }
  */

  /*
  // If you were wondering why 'name' isn't passed to constructor,
  // it's because of dynamic instantiation while loading from file.
  // While it's possible to pass arguments to dynamically called
  // constructor, it would be difficult to pass it a name before
  // anything was actually loaded yet.
  constructor()
  {
    super();
  }
  */

  // Creates a new instance of game entity of type saved in id.
  static createInstanceFromId(id: Id, ...args: any[])
  {
    ASSERT_FATAL(id !== null,
      "Invalid (null) id passed to GameEntity::createInstance()");

    let newEntity =
      <GameEntity>SaveableObject.createInstance(id.getType(), args);

    newEntity.setId(id);
    
    return <GameEntity>newEntity;
  }

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
    if (this.playerConnectionId === null)
      return null;

    return Server.playerConnectionManager.getItem(this.playerConnectionId);
  }

  // -------------- Protected accessors -----------------

  protected get SAVE_DIRECTORY()
  {
    ASSERT_FATAL(false,
      "Attempt to access SAVE_DIRECTORY of abstract GameEntity class"
      + " (" + this.getErrorIdString() + ")");

    return "";
  }

  // ---------------- Public methods --------------------

  public generatePrompt(): string
  {
    /// TODO: Generovat nejaky smysluplny prompt.
    return "&gDummy_ingame_prompt >";
  }

  public atachPlayerConnection(connectionId: Id)
  {
    ASSERT(this.playerConnectionId !== null,
      "Attempt to attach player connection to '" + this.getErrorIdString()
      + "' which already has a connection attached to it. If you want"
      + " to change which connection is attached to this entity, use"
      + " detachPlayerConnection() first and then attach a new one.");

    this.playerConnectionId = connectionId;
  }

  public detachPlayerConnection()
  {
    // TODO
    this.playerConnectionId = null;
  }

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

  // Returns something like "Character 'Zuzka' (id: d-imt2xk99)".
  // (indended for use in error messages)
  public getErrorIdString()
  {
    return this.className + " '" + this.name + "'"
      + " (id: " + this.getId().getStringId() + ")";
  }

  // -------------- Private class data ----------------

  // null if no player is connected to (is playing as) this entity,
  // connectionId otherwise.
  private playerConnectionId: Id = null;
  // Flag saying that playerConnectionId is not to be saved to JSON.
  private static playerConnectionId = { isSaved: false };

  // --------------- Protected methods ------------------

  // Send message to the connected player that command is not recognized.
  protected unknownCommand()
  {
    if (this.playerConnection)
      this.playerConnection.sendAsBlock("&gHuh?!?");
  }

  // ---------------- Command handlers ------------------

  // Prevents accidental quitting without typing full 'quit' commmand.s
  protected doQui(argument: string)
  {
    if (this.playerConnection)
    {
      this.playerConnection
        .sendAsBlock("&gYou have to type quit--no less, to quit!");
    }
  }

  protected doQuit(argument: string)
  {
    if (this.playerConnection)
    {
      this.announcePlayerLeavingGame();
      this.playerConnection.enterLobby();
      this.playerConnection
        .sendAsBlock("\n&gGoodbye, friend.. Come back soon!");
      this.playerConnection.detachFromGameEntity();
    }
  }
}