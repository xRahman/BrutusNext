/// TODO: Tohle komplet zrušit, prototypy jsou vyřešeny lépe.

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
/// TODO:
  Možná by tohle mohlo být v modulu Room, pokud RoomInfo nebude potřeba od
  nikud jinud.
*/

import {ExtraDescription} from '../../game/ExtraDescription';
import {SaveableObject} from '../../shared/SaveableObject';

export class RoomInfo extends SaveableObject
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
  public extraDescriptions = [];
}