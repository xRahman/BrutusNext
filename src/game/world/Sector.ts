/*
  Part of BrutusNEXT

  Sector is a fixed set of rooms. Their contents may still be
  randomisable, but their number, position (interconnecting exits)
  and names are immutable.
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT'
import {Id} from '../../shared/Id';
import {Game} from '../../game/Game';
import {GameEntity} from '../../game/GameEntity';
import {Room} from '../../game/world/Room';

export class Sector extends GameEntity
{
  constructor(name: string)
  {
    super(name);

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // --------------- Public accessors -------------------

  // -------------- Protected accessors -----------------

  protected get SAVE_DIRECTORY() { return "./data/prototypes/sectors/"; }

  // ---------------- Public methods --------------------

  public addNewRoom(roomName: string): Id
  {
    let newRoom = new Room(roomName);
    let newRoomId = Game.roomList.addEntityUnderNewId(newRoom);

    // Add new room if to the list of entities contained in this sector.
    this.insertEntity(newRoomId);

    return newRoomId;
  }

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}

// Add constructor of this class as a property of global object,
// so it's instances can be created dynamically in runtime.
global['Sector'] = Sector;