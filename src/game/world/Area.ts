/*
  Part of BrutusNEXT

  Area (a set of Rooms).

  Area is inherited from Sector, because it basically is a set of
  immutable rooms with defined connections to other areas.
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT'
import {Sector} from '../../game/world/Sector';

export class Area extends Sector
{
  constructor(name: string)
  {
    super(name);

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  static get SAVE_DIRECTORY() { return "./data/areas/"; }

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  // What file will this area be saved to.
  protected getSavePath(): string
  {
    return Area.SAVE_DIRECTORY + this.getIdStringValue() + ".json";
  }

  // ---------------- Private methods -------------------
}