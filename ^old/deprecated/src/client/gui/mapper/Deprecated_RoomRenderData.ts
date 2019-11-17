/*
  Part of BrutusNEXT

  Data from which rooms are rendered.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {RoomData} from '../../../shared/game/world/RoomData';
import {ExitRenderData} from '../../../client/gui/mapper/ExitRenderData';

export class RoomRenderData extends RoomData
{
  //------------------ Public data ----------------------

  /// Moved to Room.
  /*
  // When a room is added to this.mapData, it is added
  // as 'explored = true' and all rooms reachable by its
  // exits are added as 'explored = false'.
  public explored = false;
  */

  //------------------ Private data ---------------------

  /// Moved to Room.
  /*
  // Client-side id, not entity id.
  // (It is composed from room coordinates by MapData.composeRoomId()).
  private renderId: string = null;
  */

  // --------------- Public accessors -------------------

  /// Moved to Room.
  /*
  public getRenderId() { return this.renderId; }
  */

  // ---------------- Public methods --------------------

  /// Moved to Room.
  /*
  /// TODO: Předělat na vyrábění exitů na serveru.
  /// Tohle by nemělo existovat - exit se má vyrábět na serveru
  /// a client má pak dostat updatnutá data roomů, kterých se to týká
  /// (respektive všichni klienti, kteří to mají v aktivním výřezu).
  public setExit(direction: string, toRoom: RoomRenderData)
  {
    if (!direction)
    {
      ERROR("Invalid 'direction'");
      return;
    }

    let exitRenderData = new ExitRenderData();

    if (!exitRenderData.init(this, toRoom, direction))
      return;

    this.exits.set(direction, exitRenderData);
  }

  // Creates a unique room id based on it's coordinates
  // (something like '[5,12,37]').
  // -> Returns 'false' on error.
  public initRenderId()
  {
    if (!this.coords)
    {
      ERROR('Unable to compose room id: Missing or invalid room coordinates');
      return false;
    }

    // Render id will be something like: '[0,-12,37]'.
    this.renderId = '[' + this.coords.s + ','
                  + this.coords.e + ','
                  + this.coords.u + ']';

    return true;
  }
  */
}