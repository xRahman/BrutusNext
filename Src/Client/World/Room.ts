/*
  Part of BrutusNEXT

  Client-side room
*/

import { Coords } from "../../Shared/Class/Coords";
import { Exit } from "../../Client/World/Exit";

export class Room
{
  public readonly icon =
  {
    // path: "Images/Exits/ExitUp.svg",
    path: "Images/Rooms/Circle.svg",
    // scale: 2.0
    scale: 1.0
  };

  public readonly exits: { [name in Exit.Direction]: Exit } =
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

  public getExit(direction: Exit.Direction): Exit
  {
    return this.exits[direction];
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

  public deleteExitsTo(to: Coords): void
  {
    for (const exit of Object.values(this.exits))
    {
      if (exit.to === "Nowhere")
        continue;

      if (exit.to.equals(to))
        exit.to = "Nowhere";
    }
  }
}