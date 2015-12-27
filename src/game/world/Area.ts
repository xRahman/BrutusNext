/*
  Part of BrutusNEXT

  Area (a set of Rooms).
*/

'use strict';

import {GameEntity} from '../../game/GameEntity';
import {AreaData} from '../../game/world/AreaData';

export class Area extends GameEntity
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

  static get SAVE_DIRECTORY() { return "./data/areas/"; }

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