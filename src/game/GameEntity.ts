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


  // null if no player is connected to (is playing as) this entity,
  // connectionId otherwise.
  protected myPlayerConnectionId = null;

  // --------------- Protected methods ------------------

  // Send message to the connected player that command is not recognized.
  protected unknownCommand()
  {
    if (this.myPlayerConnectionId)
      this.playerConnection.send("&gHuh?!?");
  }
}