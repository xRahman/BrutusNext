/*
  Part of BrutusNEXT

  Class implementing [x, y, z] coordinates.
*/

'use strict';

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

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}