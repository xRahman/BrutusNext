/*
  Part of BrutusNEXT

  Client-side version of game world
*/

import { Coords } from "../../Shared/Class/Coords";
import { Room } from "../../Client/World/Room";
import { World } from "../../Client/World/World";

export namespace Editor
{
  export function createRoom(coords: Coords): Room
  {
    return World.createRoom(coords);
  }

  export function deleteRoom(room: Room): void
  {
    World.deleteRoom(room);
  }
}