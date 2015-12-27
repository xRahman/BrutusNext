/*
  Part of BrutusNEXT

  Saveable data members for Realm class.
*/

'use strict';

import {GameEntityData} from '../../game/GameEntityData';

export class RealmData extends GameEntityData
{
  constructor(public name: string)
  {
    super(name);

    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }
}