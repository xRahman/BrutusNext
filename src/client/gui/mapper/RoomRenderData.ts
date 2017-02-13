/*
  Part of BrutusNEXT

  Data from which rooms are rendered.
*/

'use strict';

import {RoomData} from '../../../client/gui/mapper/RoomData';

export class RoomRenderData
{
  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  public rooms = new Map<string, RoomData>();

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public set(room: RoomData)
  {
    if (!room.id)
      return;

    // Set room data to this.rooms hashmap under it's id.
    this.rooms.set(room.id, room);
  }

  public getRenderArray()
  {
    // This piece of black magic obtains array of hashmap values
    // (Map.values() returns an iterable object, elipsis operator
    //  converts it to an array).
    return [...this.rooms.values()];
  }  

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

}