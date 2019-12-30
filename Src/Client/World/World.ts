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

  export function getRoomAtCoords(coords: Coords): Room | "Nothing there"
  {
    return grid.get(coords);
  }

  export function createRoom(coords: Coords): Room
  {
    if (grid.get(coords) !== "Nothing there")
    {
      throw Error(`Failed to create room at coords ${coords.toString()}"`
        + ` because there already is a room at those coords`);
    }

    const newRoom = new Room(coords);

    grid.set(coords, newRoom);

    return newRoom;
  }

  export function deleteRoom(room: Room): void
  {
    grid.delete(room.getCoords());
  }
}