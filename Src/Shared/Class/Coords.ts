/*
  Part of BrutusNEXT

  World [e, n, u] coordinates
*/

import { StringUtils } from "../../Shared/Utils/StringUtils";

export class Coords
{
  // Creates a string id unique to a given pair of coords
  // regardless or their order (this is used to deduplicate
  // room exits).
  public static composeExitId(from: Coords, to: Coords): string
  {
    if (from.e < to.e)
      return joinCoordStrings(from, to);

    if (from.e > to.e)
      return joinCoordStrings(to, from);

    if (from.n < to.n)
      return joinCoordStrings(from, to);

    if (from.n > to.n)
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

    return new Coords(coords.e, coords.n, coords.u);
  }

  public static add(c1: Coords, c2: Coords): Coords
  {
    return new Coords(c1.e + c2.e, c1.n + c2.n, c1.u + c2.u);
  }

  public static c1MinusC2(c1: Coords, c2: Coords): Coords
  {
    return new Coords(c1.e - c2.e, c1.n - c2.n, c1.u - c2.u);
  }

  constructor
  (
    public readonly e: number,
    public readonly n: number,
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
  //   result.n += op0.n + op1.n;
  //   result.u += op0.u + op1.u;

  //   // Add the remaining operands.
  //   for (let operand of moreOps)
  //   {
  //     result.e += operand.e;
  //     result.n += operand.n;
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
  //   if (op0.n !== op1.n)
  //     return false;
  //   if (op0.u !== op1.u)
  //     return false;

  //   // Copmare remaining operands with the first one.
  //   for (let i = 1; i < moreOps.length; i++)
  //   {
  //     if (op0.e !== moreOps[i].e)
  //       return false;
  //     if (op0.n !== moreOps[i].n)
  //       return false;
  //     if (op0.u !== moreOps[i].u)
  //       return false;
  //   }

  //   return true;
  // }

  // ---------------- Public methods --------------------

  public equals(coords: Coords): boolean
  {
    return this.e === coords.e && this.n === coords.n && this.u === coords.u;
  }

  public getAdjacentCoords(): Array<Coords>
  {
    const adjacentCoords: Array<Coords> = [];

    for (let e = -1; e <= 1; e++)
    {
      for (let n = -1; n <= 1; n++)
      {
        for (let u = -1; u <= 1; u++)
        {
          if (e === 0 && n === 0 && u === 0)
            continue;

          adjacentCoords.push(Coords.add(this, new Coords(e, n, u)));
        }
      }
    }

    return adjacentCoords;
  }

  public isAdjacentTo(coords: Coords): boolean
  {
    const eDistance = Math.abs(this.e - coords.e);
    const nDistance = Math.abs(this.n - coords.n);
    const uDistance = Math.abs(this.u - coords.u);

    if (eDistance === 0 && nDistance === 0 && uDistance === 0)
      return false;

    if (eDistance <= 1 && nDistance <= 1 && uDistance <= 1)
      return true;

    return false;
  }

  public getFlooredCoords(): Coords
  {
    return new Coords
    (
      Math.floor(this.e),
      Math.floor(this.n),
      Math.floor(this.u)
    );
  }

  public toString(): string
  {
    return `[ e: ${this.e}, n: ${this.n}, u: ${this.u} ]`;
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
function parseCoordsString(coords: string): { e: number, n: number, u: number }
{
  const result = { e: NaN, n: NaN, u: NaN };

  // ! Throws exception on error.
  StringUtils.scan(coords, "[ e: &{e}, n: &{n}, u: &{u} ]", result);

  return result;

  // // ! Throws exception on error.
  // const e = StringUtils.toNumber(scanResult.e);
  // // ! Throws exception on error.
  // const s = StringUtils.toNumber(scanResult.n);
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