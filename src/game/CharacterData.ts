/*
  Part of BrutusNEXT

  Saveable data members for Character class.
*/

'use strict';

import {GameEntityData} from '../game/GameEntityData';

export class CharacterData extends GameEntityData
{
  constructor(public name: string)
  {
    super(name);

    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // dateofCreation always initializes to current time, but for existing
  // characters will be overwritten when loading from file. 
  public timeOfCreation = new Date();
}