/*
  Part of BrutusNEXT

  Sector is a fixed set of rooms. Their contents may still be
  randomisable, but their number, position (interconnecting exits)
  and names are immutable.
*/

'use strict';

import {Game} from '../../game/Game';
import {ServerGameEntity} from '../../../server/game/entity/ServerGameEntity';
import {Classes} from '../../../shared/lib/class/Classes';

export class Sector extends ServerGameEntity
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

  ///protected static get SAVE_DIRECTORY() { return "./data/sectors/"; }

  // ---------------- Public methods --------------------

  /// Moment�ln? se to nikde nevol�, tak to nebudu ?e�it.
  /*
  public createRoom(param: { name: string, prototype: string }): EntityId
  {
    let newRoomId = this.createEntity
    (
      {
        name: param.name,
        prototype: param.prototype,
        idList: Game.rooms
      }
    );

    // Add new room id to the list of entities contained in this area.
    this.insertEntity(newRoomId);

    return newRoomId;
  }
  */

  //----------------- Protected data --------------------

  // --------------- Protected methods ------------------

  // ~ Overrides Entity.addToNameLists().
  protected addToNameLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.addToAbbrevLists().
  protected addToAbbrevLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.removeFromNameLists().
  protected removeFromNameLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.removeFromAbbrevLists().
  protected removeFromAbbrevLists()
  {
    /// TODO
  }

  // ---------------- Private methods -------------------
}

Classes.registerEntityClass(Sector);