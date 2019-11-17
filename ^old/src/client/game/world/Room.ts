/*
  Part of BrutusNEXT

  Client-side room (a graph node that game world consists of).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Classes} from '../../../shared/lib/class/Classes';
import {GameEntity} from '../../../client/game/GameEntity';
import {RoomData} from '../../../shared/game/world/RoomData';

export class Room extends GameEntity
{
  constructor()
  {
    super();

    this.version = 0;
  }

  public data: RoomData = new RoomData(this);

  // 'true' if the room exists on the server
  // (nonexisting room placeholders are displayed in edit mode).
  public exists = false;

  // Rooms have 'explore' = 'false' when they are connected by an exit
  // from an explored room or when they don't exist at all (they are
  // rendered as placeholders in editor mode so they can be created
  // by mouse click).
  public explored = false;

/// Zkusím místo toho použít entity id.
/// Možná by bylo lepší 'htmlId'
  // Client-side id, not entity id.
  // (It is composed from room coordinates by MapData.composeRoomId()).
  ///private renderId: string = null;

  // --------------- Public accessors -------------------

  ///public getRenderId() { return this.renderId; }

  // -------------- Protected accessors -----------------

  // ---------------- Public methods --------------------

  public hasExit(exitName: string)
  {
    return this.data.exits.has(exitName);
  }

  /// TODO: Předělat na vyrábění exitů na serveru.
  /// Tohle by nemělo existovat - exit se má vyrábět na serveru
  /// a client má pak dostat updatnutá data roomů, kterých se to týká
  /// (respektive všichni klienti, kteří to mají v aktivním výřezu).
  /*
  public setExit(direction: string, toRoom: Room)
  {
    if (!direction)
    {
      ERROR("Invalid 'direction'");
      return;
    }

    let exitRenderData = new ExitRenderData();

    if (!exitRenderData.init(this, toRoom, direction))
      return;

    this.data.exits.set(direction, exitRenderData);
  }
  */

  /*
  // Creates a unique room id based on it's coordinates
  // (something like '[5,12,37]').
  // -> Returns 'false' on error.
  public initRenderId()
  {
    if (!this.data.coords)
    {
      ERROR('Unable to compose room id: Missing or invalid room coordinates');
      return false;
    }

    // Render id will be something like: '[0,-12,37]'.
    this.renderId = '[' + this.data.coords.s + ','
                  + this.data.coords.e + ','
                  + this.data.coords.u + ']';

    return true;
  }
  */

  // ---------------- Protected data --------------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}

Classes.registerEntityClass(Room);