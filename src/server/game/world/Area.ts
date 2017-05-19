/*
  Part of BrutusNEXT

  Area (a set of Rooms).

  Area is inherited from Sector, because it basically is a set of
  immutable rooms with defined connections to other areas.
*/

'use strict';

///import {Game} from '../../game/Game';
import {ServerGameEntity} from '../../../server/game/entity/ServerGameEntity';
import {Classes} from '../../../shared/lib/class/Classes';

export class Area  extends ServerGameEntity
{
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }
  
  // --------------- Public accessors -------------------

  // -------------- Protected accessors -----------------

  ///protected static get SAVE_DIRECTORY() { return "./data/areas/"; }

  // ---------------- Public methods --------------------

  /// Pozn: Area tu nic nemá, protože je zděděná ze Sectoru, kde
  ///  je veškerá funkcionalita. Možná to nakonec bude jinak...

  //----------------- Protected data --------------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}

Classes.registerEntityClass(Area);