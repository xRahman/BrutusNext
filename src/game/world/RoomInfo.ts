/*
  Part of BrutusNEXT

  Information about Room.

  - description
  - extra descriptions
  - initial contents (or load script, whitchever is used)
  - terrain type
  - room flags (if they are used)
*/

'use strict';

/*
///
  Možná by tohle mohlo být v modulu Room, pokud RoomInfo nebude potřeba od
  nikud jinud.
*/

import {ExtraDescription} from '../../game/ExtraDescription';
import {IdableSaveableObject} from '../../shared/IdableSaveableObject';
import {SaveableArray} from '../../shared/SaveableArray';

export class RoomInfo extends IdableSaveableObject
{
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  public description = "Unfinished room.";
  public extraDescriptions =
    new SaveableArray<ExtraDescription>(ExtraDescription);
}