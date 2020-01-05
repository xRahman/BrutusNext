/*
  Part of BrutusNEXT

  Client-side version of game world
*/

import { Coords } from "../../Shared/Class/Coords";
import { Grid } from "../../Shared/Class/Grid";
import { Room } from "../../Client/World/Room";

const grid = new Grid<Room>();

export namespace World
{
  // export function getRoomsInDepth(depth: number): Array<Room>
  // {
  //   return grid.getItemsInDepth(depth);
  // }

  export function getRoom(coords: Coords): Room | "Nothing there"
  {
    return grid.get(coords);
  }

  export function setRoom(room: Room): void
  {
    grid.set(room.coords, room);
  }

  // ! Throws exception on error.
  export function deleteRoom(room: Room): void
  {
    // ! Throws exception on error.
    grid.delete(room.coords);
  }

  export function getMinimumCoords(): Coords { return grid.mininumCoords; }
  export function getMaximumCoords(): Coords { return grid.maximumCoords; }
}