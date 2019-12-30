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
}