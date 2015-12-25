/*
  Part of BrutusNEXT

  Abstract ancestor for all game entities (rooms, items, characters, etc.).
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {Server} from '../server/Server';
import {Id} from '../shared/Id';
import {GameEntityData} from '../game/GameEntityData';
import {CommandInterpretter} from '../game/CommandInterpretter';

///export abstract class GameEntity extends SaveableContainer
export abstract class GameEntity extends CommandInterpretter
{
  // --------------- Public accessors -------------------

  public get name()
  {
    if (!ASSERT(this.myData !== null, "Attempt to access 'name' property on"
          + "entity that doesn't have valid myData"))
      return "";

    return this.myData.name;
  }

  public get playerConnection()
  {
    // We need to return null if myPlayerConnectionId is null, because
    // if accessing playerConnection when myPlayerConnectionId is null
    // was treated an error, saving game entity with null id would crash
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

  // Player connected to this entity is entering game.
  //   Needs to be overriden if something is going to happen (like message
  // that a player character has just entered game).
  public announcePlayerEnteringGame() { }

  // ---------------- Public methods --------------------


  // -------------- Protected class data ----------------

  protected myData: GameEntityData = null;


  // Id.NULL if no player is connected to (is playing as) this entity,
  // connectionId otherwise.
  protected myPlayerConnectionId: Id = Id.NULL;

  // --------------- Protected methods ------------------

  // Send message to the connected player that command is not recognized.
  protected unknownCommand()
  {
    if (this.myPlayerConnectionId)
      this.playerConnection.send("&gHuh?!?");
  }
}