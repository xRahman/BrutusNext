/*
  Part of BrutusNEXT

  Sector is a fixed set of rooms. Their contents may still be
  randomisable, but their number, position (interconnecting exits)
  and names are immutable.
*/

'use strict';

import {GameEntity} from '../../game/GameEntity';
import {SectorData} from '../../game/world/SectorData';

export class Sector extends GameEntity
{
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;

    this.myData = new SectorData(name);
  }

  static get SAVE_DIRECTORY() { return "./data/prototypes/sectors/"; }

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  protected myGetSavePath(): string
  {
    return Sector.SAVE_DIRECTORY + this.name + ".json";
  }

  // ---------------- Private methods -------------------
}