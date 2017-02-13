/*
  Part of BrutusNEXT

  Class implementing [x, y, z] coordinates.
*/

'use strict';

export class Coords
{
  // Public overloads.
  constructor()
  constructor(x: number, y: number, z: number)
  // Overloads implementation (not public).
  constructor(x?: number, y?: number, z?: number)
  {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  //------------------ Public data ---------------------- 

  public x = null;
  public y = null;
  public z = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}