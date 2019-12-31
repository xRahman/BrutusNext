/*
  Part of BrutusNEXT

  Client-side room
*/

import { Coords } from "../../Shared/Class/Coords";

export class Room
{
  public static readonly NONEXISTING_ROOM_PIXEL_SIZE = 10;

  public readonly icon =
  {
    path: "Images/Rooms/Circle.svg",
    pixelSize: 10
  };

  constructor(private readonly coords: Coords)
  {
  }

  public getCoords(): Coords { return this.coords; }
}