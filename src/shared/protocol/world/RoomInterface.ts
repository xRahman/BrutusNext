/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Specifies format of room data.
*/

'use strict';

import {Coords} from '../../../shared/type/Coords';
import {ExitsInterface} from '../../../shared/protocol/world/ExitsInterface';

export interface RoomInterface
{
  // 'true' if the room exists on the server
  // (nonexisting room placeholders are displayed in edit mode).
  exists: boolean,
  name: string,
  explored: boolean;
  coords: { x: number, y: number, z: number},
  exits: ExitsInterface
}