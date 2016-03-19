/*
  Part of BrutusNEXT

  Room (a graph node that game world consists of).
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT'
import {Id} from '../../shared/Id';
import {GameEntity} from '../../game/GameEntity';
import {Game} from '../../game/Game';
import {RoomInfo} from '../../game/world/RoomInfo';
import {Exits} from '../../game/world/Exits';

export class Room extends GameEntity
{
  constructor(name: string)
  {
    super(name);

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  static get SAVE_DIRECTORY() { return "./data/rooms/"; }

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // Entity adds itself to approptiate manager
  // (so it can be searched by name, etc.)
  protected addToManager()
  {
    Game.roomManager.registerEntity(this);
  }

  // -------------- Protected class data ----------------

  // id of prototype room. If it's Id.NULL, this room is a prototype.
  protected myPrototypeId: Id = Id.NULL;

  // Description, extra descriptions, room flags, terrain type, etc.
  // If this is null, values from prototype are used.
  protected myRoomInfo: RoomInfo = null;

  // List of exits to other entities (usually rooms).
  protected myExits = new Exits();

  // --------------- Protected methods ------------------

  /// TODO: Tohle nejspis bude jinak, jmena room nejsou unikatni.
  /// to budou mit jinak.
  // What file will this area be saved to.
  protected getSavePath(): string
  {
    return Room.SAVE_DIRECTORY + this.getIdStringValue() + ".json";
  }

  // ---------------- Private methods -------------------
}