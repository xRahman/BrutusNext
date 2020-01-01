/*
  Part of BrutusNEXT

  Client-side version of game world
*/

import { Coords } from "../../Shared/Class/Coords";
import { Grid } from "../../Shared/Class/Grid";
import { Room } from "../../Client/World/Room";
import { Exit } from "../../Client/World/Exit";

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

  // ! Throws exception on error.
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

  // ! Throws exception on error.
  export function deleteRoom(room: Room): void
  {
    // ! Throws exception on error.
    grid.delete(room.coords);
  }

  // ! Throws exception on error.
  // 'from' and 'to' must be different coords.
  export function createExit(from: Coords, to: Coords): void
  {
    // ! Throws exception on error.
    const direction = Exit.getDirection(from, to);

    const fromRoom = grid.get(from);

    if (fromRoom === "Nothing there")
    {
      throw Error(`Failed to create exit from ${from.toString()}`
        + ` because no room exists there`);
    }

    const toRoom = grid.get(to);

    if (toRoom === "Nothing there")
    {
      throw Error(`Failed to create exit to ${to.toString()}`
        + ` because no room exists there`);
    }

    fromRoom.setRoomInDirection(direction, toRoom);
    toRoom.setRoomInDirection(Exit.reverse(direction), fromRoom);
  }
}