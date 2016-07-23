/*
  Part of BrutusNEXT

  Sector is a fixed set of rooms. Their contents may still be
  randomisable, but their number, position (interconnecting exits)
  and names are immutable.
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT'
import {Game} from '../../game/Game';
import {GameEntity} from '../../game/GameEntity';
import {EntityId} from '../../game/EntityId';
import {Room} from '../../game/world/Room';

export class Sector extends GameEntity
{
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // --------------- Public accessors -------------------

  // -------------- Protected accessors -----------------

  protected static get SAVE_DIRECTORY() { return "./data/sectors/"; }

  // ---------------- Public methods --------------------

  public createRoom(param: { name: string, prototype: string }): EntityId
  {
    let newRoomId = this.createEntity
    (
      {
        name: param.name,
        prototype: param.prototype,
        container: Game.roomList
      }
    );

    // Add new room id to the list of entities contained in this area.
    this.insertEntity(newRoomId);

    return newRoomId;
  }

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}