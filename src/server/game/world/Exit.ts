/*
  Part of BrutusNEXT

  Server-side exit (connection between two rooms).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
///import {Attributes} from '../../../shared/lib/class/Attributes';
import {GameEntity} from '../../../server/game/GameEntity';
import {Room} from '../../../server/game/world/Room';
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
  public from: (Room | null) = null;
  public to: (Room | null) = null;

  // --------------- Public accessors -------------------

  // -------------- Protected accessors -----------------

  // ---------------- Public methods --------------------

  // ---------------- Protected data --------------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}

Classes.registerEntityClass(Exit);