/*
  Part of BrutusNEXT

  Room (a graph node that game world consists of).
*/

'use strict';

import {GameEntity} from '../../game/GameEntity';
import {RoomData} from '../../game/world/RoomData';

export class Room extends GameEntity
{
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;

    this.myData = new RoomData(name);
  }

  static get SAVE_DIRECTORY() { return "./data/rooms/"; }

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  /// TODO: Tohle nejspis bude jinak, jmena room nejsou unikatni.
  /// to budou mit jinak.
  // What file will this area be saved to.
  protected myGetSavePath(): string
  {
    return Room.SAVE_DIRECTORY + this.name + ".json";
  }

  // ---------------- Private methods -------------------
}