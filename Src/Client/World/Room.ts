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
    n: Exit.nowhere(),
    ne: Exit.nowhere(),
    e: Exit.nowhere(),
    se: Exit.nowhere(),
    s: Exit.nowhere(),
    sw: Exit.nowhere(),
    w: Exit.nowhere(),
    nw: Exit.nowhere(),
    u: Exit.nowhere(),
    d: Exit.nowhere()
  };

  constructor(public readonly coords: Coords)
  {
  }

  public setRoomInDirection
  (
    direction: Exit.Direction,
    targetRoom: Room | "Nowhere"
  )
  : void
  {
    this.exits[direction].to = targetRoom;
  }
}