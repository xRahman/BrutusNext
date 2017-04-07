/*
  Part of BrutusNEXT

  Class implementing associative 3d array.
*/

/*
  'Array3d' is associative - you can use negative indexes.
  It can have 'holes' (reading nonexistent item returns 'undefined').
*/

'use strict';

import {Coords} from '../../shared/type/Coords';

export class Array3d<T>
{
  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  private data = null;

  // Point in array with smallest 's', 'e' and 'u'
  private min = new Coords();
  // Point in array with biggest 's', 'e' and 'u'.
  private max = new Coords();

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // Size of the array on 'n-s' axis.
  public get length() { return this.max.s - this.min.s; }
  // Size of the array on 'e-w' axis.
  public get width() { return this.max.e - this.min.e; }
  // Size of the array on 'u-d' axis.
  public get height() { return this.max.u - this.min.u; }

  // ---------------- Public methods --------------------

  // Reads from position [s, e, u].
  // -> Returns 'undefined' if item isn't in the array.
  public get(coords: Coords): T
  {
    // Two-dimensional associative sub-map.
    let yzArray = this.data.get(coords.s);

    if (!yzArray)
      return undefined;

    // One-dimensional associative sub-map in.
    let zArray = yzArray.get(coords.e);

    if (!zArray)
      return undefined;

    return zArray.get(coords.u);
  }

  // Sets 'item' at position [s, e, u].
  public set(item: T, coords: Coords)
  {
    if (!this.data)
      this.data = new Map<number, any>();

    // Two-dimensional associative sub-map.
    let yzArray = this.data.get(coords.s);

    if (!yzArray)
    {
      yzArray = new Map<number, any>();

      this.data.set(coords.s, yzArray);
    }

    // One-dimensional associative sub-map.
    let zArray = yzArray.get(coords.e);

    if (!zArray)
    {
      zArray = new Map<number, T>();
      yzArray.set(coords.e, zArray);
    }
    
    zArray.set(coords.u, item);
    
    // Update the min and max point so we know the dimensions
    // of this 3d array.
    this.updateSize(coords);
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  // Updates remembered dimension of the 3d array to
  // include point 'coords'.
  private updateSize(coords: Coords)
  {
    if (this.min.s > coords.s)
      this.min.s = coords.s;

    if (this.min.e > coords.e)
      this.min.e = coords.e;

    if (this.min.u > coords.u)
      this.min.u = coords.u;

    if (this.max.s < coords.s)
      this.max.s = coords.s;

    if (this.max.e < coords.e)
      this.max.e = coords.e;

    if (this.max.u < coords.u)
      this.max.u = coords.u;
  }
}