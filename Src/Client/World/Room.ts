/*
  Part of BrutusNEXT

  Client-side room
*/

import { Coords } from "../../Shared/Class/Coords";
import { Exit } from "../../Client/World/Exit";

export class Room
{
  public static readonly DEFAULT_ROOM_PIXEL_SIZE = 10;

  public readonly icon =
  {
    path: "Images/Rooms/Circle.svg",
    pixelSize: Room.DEFAULT_ROOM_PIXEL_SIZE
  };

  public readonly exits: { [name: string]: Exit } =
  {
    n: new Exit("Nowhere"),
    ne: new Exit("Nowhere"),
    e: new Exit("Nowhere"),
    se: new Exit("Nowhere"),
    s: new Exit("Nowhere"),
    sw: new Exit("Nowhere"),
    w: new Exit("Nowhere"),
    nw: new Exit("Nowhere"),
    u: new Exit("Nowhere"),
    d: new Exit("Nowhere")
  };

  constructor(public readonly coords: Coords)
  {
  }

  public hasExit(direction: Exit.Direction): boolean
  {
    return this.exits[direction].to !== "Nowhere";
  }

  public setExitDestination
  (
    direction: Exit.Direction,
    coords: Coords | "Nowhere"
  )
  : void
  {
    this.exits[direction].to = coords;
  }
}