/*
  Part of BrutusNEXT

  Abstract ancestor for all game entities (rooms, items, characters, etc.).
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {Server} from '../server/Server';
import {CommandInterpretter} from '../game/CommandInterpretter';

///export abstract class GameEntity extends SaveableContainer
export class GameEntity extends CommandInterpretter
{

  // ---------------- Public methods --------------------

  // -------------- Protected class data ----------------

  protected get playerConnection()
  {
    return Server.playerConnectionManager
      .getPlayerConnection(this.myPlayerConnectionId);
  }

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