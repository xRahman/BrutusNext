/*
  Part of BrutusNEXT

  Dimension (a set of Realms).
*/

'use strict';

import {GameEntity} from '../../game/GameEntity';
import {DimensionData} from '../../game/world/DimensionData';

export class Dimension extends GameEntity
{
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;

    this.myData = new DimensionData(name);
  }

  static get SAVE_DIRECTORY() { return "./data/dimensions/"; }

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  // What file will this area be saved to.
  protected myGetSavePath(): string
  {
    return Dimension.SAVE_DIRECTORY + this.name + ".json";
  }

  // ---------------- Private methods -------------------
}