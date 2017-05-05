/*
  Part of BrutusNEXT

  Class implementing [x, y, z] coordinates.
*/

'use strict';

import {ERROR} from '../../shared/lib/error/ERROR';

export class Coords
{
  // Public overloads.
  constructor()
  constructor(s: number, e: number, u: number)
  // Overloads implementation (not public).
  constructor(s?: number, e?: number, u?: number)
  {
    this.s = s || 0;
    this.e = e || 0;
    this.u = u || 0;
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  //------------------ Public data ---------------------- 

  public s = null;
  public e = null;
  public u = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ------------- Public static methods ----------------

  // -> Returns new Coords which is the sum of operands.
  public static sum(op0: Coords, op1: Coords, ...moreOps: Array<Coords>)
  {
    let result = new Coords();

    // Add the two required operands.
    result.e += op0.e + op1.e;
    result.s += op0.s + op1.s;
    result.u += op0.u + op1.u;

    // Add the remaining operands.
    for (let operand of moreOps)
    {
      result.e += operand.e;
      result.s += operand.s;
      result.u += operand.u;
    }

    return result;
  }

  // -> Returns 'true' if all operands are equal.
  public static equals(op0: Coords, op1: Coords, ...moreOps: Array<Coords>)
  {
    // Copmare second required operand with the first one.
    if (op0.e !== op1.e)
      return false;
    if (op0.s !== op1.s)
      return false;
    if (op0.u !== op1.u)
      return false;

    // Copmare remaining operands with the first one.
    for (let i = 1; i < moreOps.length; i++)
    {
      if (op0.e !== moreOps[i].e)
        return false;
      if (op0.s !== moreOps[i].s)
        return false;
      if (op0.u !== moreOps[i].u)
        return false;
    }

    return true;
  }

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}