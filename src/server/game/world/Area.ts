/*
  Part of BrutusNEXT

  Area (a set of Rooms).

  Area is inherited from Sector, because it basically is a set of
  immutable rooms with defined connections to other areas.
*/

'use strict';

///import {Game} from '../../game/Game';
import {GameEntity} from '../../../server/game/GameEntity';
import {Classes} from '../../../shared/lib/class/Classes';

export class Area  extends GameEntity
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

  // ~ Overrides Entity.addToNameLists().
  protected addToNameLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.addToAbbrevLists().
  protected addToAbbrevLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.removeFromNameLists().
  protected removeFromNameLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.removeFromAbbrevLists().
  protected removeFromAbbrevLists()
  {
    /// TODO
  }

  // ---------------- Private methods -------------------
}

Classes.registerEntityClass(Area);