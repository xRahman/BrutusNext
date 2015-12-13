/*
  Part of BrutusNEXT

  Room (a graph node that game world consists of).
*/

'use strict';

import {GameEntity} from '../game/GameEntity';
///import {RoomData} from '../server/RoomData';

export class Room extends GameEntity
{
  constructor()
  {
    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    super({ version: 0 });
  }

  static get SAVE_DIRECTORY() { return "./data/rooms/"; }

  // ---------------- Public methods --------------------

  /*
  public save()
  {
    this.saveToFile(Room.SAVE_DIRECTORY + this.myAccountName + ".json");
  }

  public load()
  {
    this.loadFromFile(Room.SAVE_DIRECTORY + this.myAccountName + ".json");
  }
  */

  // -------------- Protected class data ----------------

  ///public myData = new RoomData();

  // --------------- Protected methods ------------------
}