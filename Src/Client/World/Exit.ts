/*
 Part of BrutusNEXT

 Room exit
*/

import { Syslog } from "../../Shared/Log/Syslog";
import { Coords } from "../../Shared/Class/Coords";

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
    const nDistance = to.n - from.n;
    const uDistance = to.u - from.u;

    if (eDistance === 0 && nDistance === 0)
      // ! Throws exception on error.
      return getVerticalDirection(uDistance);

    // ! Throws exception on error.
    // Exits in horizontal direction are allowed to be sloping up or
    // down. It means that direction like [1, 1, 1] is "sout-east",
    // not "south-east-up".
    return getHorizontalDirection(eDistance, nDistance);
  }

  // ! Throws exception on error.
  public static getUnitVector(direction: Exit.Direction): Coords
  {
    switch (direction)
    {
      case "n":
        return new Coords(0, 1, 0);

      case "ne":
        return new Coords(1, 1, 0);

      case "e":
        return new Coords(1, 0, 0);

      case "se":
        return new Coords(1, -1, 0);

      case "s":
        return new Coords(0, -1, 0);

      case "sw":
        return new Coords(-1, -1, 0);

      case "w":
        return new Coords(-1, 0, 0);

      case "nw":
        return new Coords(-1, 1, 0);

      case "u":
        return new Coords(0, 0, 1);

      case "d":
        return new Coords(0, 0, -1);

      default:
        throw Syslog.reportMissingCase(direction);
    }
  }

  constructor (public to: Coords | "Nowhere")
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
  nDistance: number
)
: Exit.HorizontalDirection
{
  if (nDistance > 0)
  {
    if (eDistance > 0)
      return "ne";

    if (eDistance < 0)
      return "nw";

    return "n";
  }

  if (nDistance < 0)
  {
    if (eDistance > 0)
      return "se";

    if (eDistance < 0)
      return "sw";

    return "s";
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