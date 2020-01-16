/*
  Part of BrutusNEXT

  World [e, s, u] coordinates
*/

import { StringUtils } from "../../Shared/Utils/StringUtils";

export class Coords
{
  // Creates a string id unique to a given pair of coords
  // regardless or their order (this is used to deduplicate
  // room exits).
  public static createExitId(from: Coords, to: Coords): string
  {
    if (from.e < to.e)
      return joinCoordStrings(from, to);

    if (from.e > to.e)
      return joinCoordStrings(to, from);

    if (from.s < to.s)
      return joinCoordStrings(from, to);

    if (from.s > to.s)
      return joinCoordStrings(to, from);

    if (from.u < to.u)
      return joinCoordStrings(from, to);

    if (from.u > to.u)
      return joinCoordStrings(to, from);

    // If both coords are equal, order doesn't matter.
    return joinCoordStrings(from, to);
  }

  public static fromString(coordsString: string): Coords
  {
    const coords = parseCoordsString(coordsString);

    return new Coords(coords.e, coords.s, coords.u);
  }

  constructor
  (
    public readonly e: number,
    public readonly s: number,
    public readonly u: number
  )
  {
  }

  // -------------- Static class data -------------------

  // ---------------- Protected data --------------------

  // ----------------- Private data ---------------------

  // ----------------- Public data ----------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ------------- Public static methods ----------------

  // // -> Returns 'undefined' if 'direction' isn't a name of an exit
  // //    to and adjacent room.
  // public static reverseDirection(direction: string)
  // {
  //   return REVERSE_DIRS[direction];
  // }

  // // -> Returns new Coords which is the sum of operands.
  // public static sum(op0: Coords, op1: Coords, ...moreOps: Array<Coords>)
  // {
  //   let result = new Coords();

  //   // Add the two required operands.
  //   result.e += op0.e + op1.e;
  //   result.s += op0.s + op1.s;
  //   result.u += op0.u + op1.u;

  //   // Add the remaining operands.
  //   for (let operand of moreOps)
  //   {
  //     result.e += operand.e;
  //     result.s += operand.s;
  //     result.u += operand.u;
  //   }

  //   return result;
  // }

  // // -> Returns 'true' if all operands are equal.
  // public static equals(op0: Coords, op1: Coords, ...moreOps: Array<Coords>)
  // {
  //   // Copmare second required operand with the first one.
  //   if (op0.e !== op1.e)
  //     return false;
  //   if (op0.s !== op1.s)
  //     return false;
  //   if (op0.u !== op1.u)
  //     return false;

  //   // Copmare remaining operands with the first one.
  //   for (let i = 1; i < moreOps.length; i++)
  //   {
  //     if (op0.e !== moreOps[i].e)
  //       return false;
  //     if (op0.s !== moreOps[i].s)
  //       return false;
  //     if (op0.u !== moreOps[i].u)
  //       return false;
  //   }

  //   return true;
  // }

  // ---------------- Public methods --------------------

  public equals(coords: Coords): boolean
  {
    return this.e === coords.e && this.s === coords.s && this.u === coords.u;
  }

  public getAdjacentCoords(): Array<Coords>
  {
    const adjacentCoords: Array<Coords> = [];

    for (let e = -1; e <= 1; e++)
    {
      for (let s = -1; s <= 1; s++)
      {
        for (let u = -1; u <= 1; u++)
        {
          if (e === 0 && s === 0 && u === 0)
            continue;

          adjacentCoords.push(this.getShiftedCoords(e, s, u));
        }
      }
    }

    return adjacentCoords;
  }

  public getShiftedCoords(e: number, s: number, u: number): Coords
  {
    return new Coords(this.e + e, this.s + s, this.u + u);
  }

  public isAdjacentTo(coords: Coords): boolean
  {
    const eDistance = Math.abs(this.e - coords.e);
    const sDistance = Math.abs(this.s - coords.s);
    const uDistance = Math.abs(this.u - coords.u);

    if (eDistance === 0 && sDistance === 0 && uDistance === 0)
      return false;

    if (eDistance <= 1 && sDistance <= 1 && uDistance <= 1)
      return true;

    return false;
  }

  public getFlooredCoords(): Coords
  {
    return new Coords
    (
      Math.floor(this.e),
      Math.floor(this.s),
      Math.floor(this.u)
    );
  }

  public toString(): string
  {
    return `[ e: ${this.e}, s: ${this.s}, u: ${this.u} ]`;
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}

// ----------------- Auxiliary Functions ---------------------

function joinCoordStrings(from: Coords, to: Coords): string
{
  return `${from.toString()}-${to.toString()}`;
}

// // ! Throws exception on error.
// function convertToNumber(str: string): number
// {
//   const value = Number(str);

//   if (Number.isNaN(value))
//   {
//     throw Error(`Failed to parse coords because argument`
//     + ` ${str} is not a number`);
//   }

//   return value;
// }

// ! Throws exception on error.
function parseCoordsString(coords: string): { e: number, s: number, u: number }
{
  const result = { e: NaN, s: NaN, u: NaN };

  // ! Throws exception on error.
  StringUtils.scan(coords, "[ e: &{e}, s: &{s}, u: &{u} ]", result);

  return result;

  // // ! Throws exception on error.
  // const e = StringUtils.toNumber(scanResult.e);
  // // ! Throws exception on error.
  // const s = StringUtils.toNumber(scanResult.s);
  // // ! Throws exception on error.
  // const u = StringUtils.toNumber(scanResult.u);

  // // ! Throws exception on error.
  // const stringValues = StringUtils.splitBySubstrings(coords, ...format);

  // if (stringValues.length !== 3)
  // {
  //   throw Error(`Failed to parse coords from string '${coords}' because`
  //     + ` it doesn't match expected format ${format.join("%d")}`);
  // }

  // const e = convertToNumber(stringValues[0]);
  // const s = convertToNumber(stringValues[1]);
  // const u = convertToNumber(stringValues[2]);

  // return { e, s, u };
}