/*
  Part of BrutusNEXT

  World [e, s, u] coordinates
*/

export class Coords
{
  public static equals(c1: Coords, c2: Coords): boolean
  {
    return c1.e === c2.e && c1.s === c2.s && c1.u === c2.u;
  }

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

  constructor(public e = 0, public s = 0, public u = 0)
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