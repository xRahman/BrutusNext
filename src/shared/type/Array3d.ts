/*
  Part of BrutusNEXT

  Class implementing associative 3d array.
*/

/*
  'Array' is associative - you can use negative indexes.
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

  // Point in array with smallest 'x, 'y' and 'z'
  private min = new Coords();
  // Point in array with biggest 'x, 'y' and 'z'.
  private max = new Coords();

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // Size of the array on 'x' axis.
  public get length() { return this.max.x - this.min.x; }
  // Size of the array on 'y' axis.
  public get width() { return this.max.y - this.min.y; }
  // Size of the array on 'z' axis.
  public get height() { return this.max.z - this.min.z; }

  // ---------------- Public methods --------------------

  // Reads from position [x, y, z].
  // -> Returns 'undefined' if item isn't in the array.
  public get(coords: Coords): T
  {
    // Two-dimensional associative sub-map.
    let yzArray = this.data.get(coords.x);

    if (!yzArray)
      return undefined;

    // One-dimensional associative sub-map in.
    let zArray = yzArray.get(coords.y);

    if (!zArray)
      return undefined;

    return zArray.get(coords.z);
  }

  // Sets 'item' at position [x, y, z].
  public set(item: T, coords: Coords)
  {
    if (!this.data)
      this.data = new Map<number, any>();

    // Two-dimensional associative sub-map.
    let yzArray = this.data.get(coords.x);

    if (!yzArray)
    {
      yzArray = new Map<number, any>();

      this.data.set(coords.x, yzArray);
    }

    // One-dimensional associative sub-map.
    let zArray = yzArray.get(coords.y);

    if (!zArray)
    {
      zArray = new Map<number, T>();
      yzArray.set(coords.y, zArray);
    }
    
    zArray.set(coords.z, item);
    
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
    if (this.min.x > coords.x)
      this.min.x = coords.x;

    if (this.min.y > coords.y)
      this.min.y = coords.y;

    if (this.min.z > coords.z)
      this.min.z = coords.z;

    if (this.max.x < coords.x)
      this.max.x = coords.x;

    if (this.max.y < coords.y)
      this.max.y = coords.y;

    if (this.max.z < coords.z)
      this.max.z = coords.z;
  }
}