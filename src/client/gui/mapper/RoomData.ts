/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Specifies format of room data.
*/

'use strict';

import {ERROR} from '../../../client/lib/error/ERROR';
import {Coords} from '../../../shared/type/Coords';
import {ExitData} from '../../../client/gui/mapper/ExitData';

export class RoomData
{
  // 'true' if the room exists on the server
  // (nonexisting room placeholders are displayed in edit mode).
  public exists = false;

  // Client-side id, not entity id.
  // (It is composed from room coordinates by MapData.composeRoomId()).
  public id: string = null;
  public name: string = null;
  // When a room is added to this.mapData, it is added
  // as 'explored = true' and all rooms reachable by its
  // exits are added as 'explored = false'.
  public explored = false;
  public coords: Coords = null;
  public exits = new Map<string, ExitData>();

  // Creates a unique room id based on it's coordinates
  // (something like '[5,12,37]').
  // -> Returns 'false' on error.
  public initId()
  {
    if (!this.coords)
    {
      ERROR('Unable to compose room id: Missing or invalid room coordinates');
      return false;
    }

    // Room id will be something like: '[5,12,37]'.
    this.id = '[' + this.coords.x + ','
                  + this.coords.y + ','
                  + this.coords.z + ']';
    return true;
  }
}