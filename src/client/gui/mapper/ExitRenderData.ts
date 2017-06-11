/*
  Part of BrutusNEXT

  Data from which exits are rendered.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Coords} from '../../../shared/lib/utils/Coords';
import {Room} from '../../../client/game/world/Room';
///import {RoomRenderData} from '../../../client/gui/mapper/RoomRenderData';

export class ExitRenderData
{
  //------------------ Public data ---------------------- 

  // Coords of connected rooms. Order only matters if
  // this is a one-way exit.
  public from = new Coords();
  public to = new Coords();

  //------------------ Private data ---------------------

  // Client-side id created by concatenating of id's
  // of connected rooms in alphabetical order.
  // (It also serves as respective svg element id).
  private id: string = null;

  // If the exit leads to unexplored room, it is considered
  // to be two-way until the room is explored (player doesn't
  // know if she will be able to return back until then).
  private oneWay = false;

  // --------------- Public accessors -------------------

  public getId() { return this.id; }

  // ---------------- Public methods --------------------

  // -> Returns 'false' if id could not be composed.
  public init
  (
    fromRoom: Room,
    toRoom: Room,
    exitName: string
  )
  {
    this.from = fromRoom.data.coords;
    this.to = toRoom.data.coords;
    this.oneWay = toRoom && !toRoom.hasExit(exitName);
    return this.initId(fromRoom.getRenderId(), toRoom.getRenderId());
  }

  // ---------------- Private methods -------------------

  // -> Returns 'false' if id could not be composed.
  private initId(fromRoomId: string, toRoomId: string)
  {
    if (!fromRoomId || !toRoomId)
    {
      ERROR('Unable to compose exit client-side id.'
        + ' Exit will not be rendered');
      return false;
    }

    // Exit render id is created from respective room
    // ids in alphabetical order (so it will be something
    // like '[0,0,0][0,0,1]').
    // (This deduplicates two-way exits.)
    if (fromRoomId < toRoomId)
      this.id = fromRoomId + toRoomId;
    else
      this.id = toRoomId + fromRoomId;

    return true;
  }
}