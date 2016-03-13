/*
  Part of BrutusNEXT

  Area (a set of Rooms).

  Area is inherited from Sector, because it basically is a set of
  immutable rooms with defined connections to other areas.
*/

'use strict';

import {Sector} from '../../game/world/Sector';
import {AreaData} from '../../game/world/AreaData';

export class Area extends Sector
{
  constructor(name: string)
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;

    this.myData = new AreaData(name);
  }

  static get SAVE_DIRECTORY() { return "./data/instances/areas/"; }

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  // What file will this area be saved to.
  protected myGetSavePath(): string
  {
    return Area.SAVE_DIRECTORY + this.name + ".json";
  }

  // ---------------- Private methods -------------------
}