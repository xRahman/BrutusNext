/*
 Part of BrutusNEXT

 Room exit
*/

import { Coords } from "../../Shared/Class/Coords";
import { Room } from "../../Client/World/Room";

const REVERSE_DIRECTION: { [direction in Exit.Direction]: Exit.Direction} =
{
 n: "s",
 nw: "se",
 w: "e",
 sw: "ne",
 s: "n",
 se: "nw",
 e: "w",
 ne: "sw",
 u: "d",
 d: "u"
};

export class Exit
{
  private static readonly exitToNowhere = new Exit("Nowhere");

  public static nowhere(): Exit { return Exit.exitToNowhere; }

  public static reverse(direction: Exit.Direction): Exit.Direction
  {
    return REVERSE_DIRECTION[direction];
  }

  // ! Throws exception on error.
  public static getDirection
  (
    from: Coords,
    to: Coords
  )
  : Exit.Direction
  {
    const eDistance = to.e - from.e;
    const sDistance = to.s - from.s;
    const uDistance = to.u - from.u;

    if (eDistance === 0 && sDistance === 0)
      // ! Throws exception on error.
      return getVerticalDirection(uDistance);

    // Exits in horizontal direction are allowed to be sloping up or
    // down. It means that direction like [1, 1, 1] is "sout-east",
    // not "south-east-up".
    // ! Throws exception on error.
    return getHorizontalDirection(eDistance, sDistance);
  }

  constructor (public to: Room | "Nowhere")
  {
  }
}

// ----------------- Auxiliary Functions ---------------------

// ! Throws exception on error.
function getVerticalDirection(uDistance: number): Exit.VerticalDirection
{
  if (uDistance > 0)
    return "u";

  if (uDistance < 0)
    return "d";

  throw Error("Failed to compute exit direction because both provided"
    + " coords are the same");
}

function getHorizontalDirection
(
  eDistance: number,
  sDistance: number
)
: Exit.HorizontalDirection
{
  if (sDistance > 0)
  {
    if (eDistance > 0)
      return "se";

    if (eDistance < 0)
      return "sw";

    return "s";
  }

  if (sDistance < 0)
  {
    if (eDistance > 0)
      return "ne";

    if (eDistance < 0)
      return "nw";

    return "n";
  }

  if (eDistance > 0)
    return "e";

  if (eDistance < 0)
    return "w";

  throw Error("Failed to compute exit direction because both provided"
    + " coords are the same");
}

// ------------------ Type Declarations ----------------------

export namespace Exit
{
  export type HorizontalDirection =
    "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

  export type VerticalDirection = "u" | "d";

  export type Direction = HorizontalDirection | VerticalDirection;
}