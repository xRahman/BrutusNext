/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Specifies format of room data.
*/

'use strict';

import {Coords} from '../../../shared/type/Coords';
import {ExitData} from '../../../shared/protocol/world/ExitData';

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
  public exits = new ExitData();
}