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
    super();

    this.version = 0;
    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
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

  /// TODO: Tohle nejspis bude jinak, jmena room nejsou unikatni.
  /// to budou mit jinak.
  // What file will this object be saved to.
  protected myGetSavePath(): string
  {
    return Room.SAVE_DIRECTORY + this.name + ".json";
  }
}