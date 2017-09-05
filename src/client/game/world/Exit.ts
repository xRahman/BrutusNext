/*
  Part of BrutusNEXT

  Client-side exit (connection between two rooms).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
///import {Attributes} from '../../../shared/lib/class/Attributes';
import {GameEntity} from '../../../client/game/GameEntity';
import {Room} from '../../../client/game/world/Room';
import {Classes} from '../../../shared/lib/class/Classes';
import {ExitData} from '../../../shared/game/world/ExitData';

export class Exit extends GameEntity
{
  constructor()
  {
    super();

    this.version = 0;
  }

  public data = new ExitData(this);

  // Connected rooms. Order only matters if this is a one-way exit.
  public from: Room = null;
  public to: Room = null;

/// Zkusím jako html id použít entity id.
  /*
  // Client-side id, not entity id.
  // (It is composed from room coordinates by MapData.composeRoomId()).
  private renderId: string = null;
  */

  // --------------- Public accessors -------------------

  ///public getRenderId() { return this.renderId; }

  // -------------- Protected accessors -----------------

  // ---------------- Public methods --------------------

  // ---------------- Protected data --------------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}

Classes.registerEntityClass(Exit);