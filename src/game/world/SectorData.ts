/*
  Part of BrutusNEXT

  Saveable data members for Sector class.
*/

'use strict';

import {Id} from '../../shared/Id';
import {GameEntityData} from '../../game/GameEntityData';
import {Room} from '../../game/world/Room';

export class SectorData extends GameEntityData
{
  constructor(public name: string)
  {
    super(name);

    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // ---------------- Public methods --------------------

  // ----------------- Public data ----------------------

}