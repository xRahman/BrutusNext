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

  // --------------- Public accessors -------------------

  // -------------- Protected accessors -----------------

  protected get SAVE_DIRECTORY() { return "./data/rooms/"; }

  // ---------------- Public methods --------------------

  // Entity adds itself to approptiate manager
  // (so it can be searched by name, etc.)
  public addToManager()
  {
    Game.roomList.addEntityUnderExistingId(this);
  }

  // -------------- Protected class data ----------------

  // id of prototype room. If it's Id.NULL, this room is a prototype.
  protected prototypeId: Id = Id.NULL;

  // Description, extra descriptions, room flags, terrain type, etc.
  // If this is null, values from prototype are used.
  protected roomInfo: RoomInfo = null;

  // List of exits to other entities (usually rooms).
  protected exits = new Exits();

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}

// Add constructor of this class as a property of global object,
// so it's instances can be created dynamically in runtime.
global['Room'] = Room;