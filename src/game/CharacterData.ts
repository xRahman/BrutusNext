/*
  Part of BrutusNEXT

  Saveable data members for Character class.
*/

import {GameEntityData} from '../game/GameEntityData';

export class CharacterData extends GameEntityData
{
  constructor()
  {
    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    super({ version: 0 });
  }
}