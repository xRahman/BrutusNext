/*
  Part of BrutusNEXT

  Associative 3d array indexed by [e, n, u] coordinates
*/

/*
  Notes:
    Math.floor() is used on all input coordiantes - it means that
    item inserted on [0.3, 0, 0] will actualy be put on [0, 0, 0].

    Grid is associative - it means that you can use negative indexes,
    it can have holes and you can use negative indexes. But it also
    means that items are not sorted by coordinates but by order of
    insertion.
*/

import { Coords } from "../../Shared/Class/Coords";

export class Grid<T>
{
  // -------------- Static class data -------------------

  // ---------------- Protected data --------------------

  // ----------------- Private data ---------------------

  private readonly data = new Map<number, Map<number, Map<number, T>>>();

  // Grid size increases automaticaly when an item with coords outside
  // of this box is inserted to it.
  private readonly size =
  {
    min: new Coords(0, 0, 0),
    max: new Coords(0, 0, 0)
  };

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  public get mininumCoords(): Coords { return this.size.min; }
  public get maximumCoords(): Coords { return this.size.max; }

  // Size of the array on 'east-west' axis.
  public get eSize(): number
  {
    return this.size.max.e - this.size.min.e;
  }

  // Size of the array on 'north-south' axis.
  public get nSize(): number
  {
    return this.size.max.n - this.size.min.n;
  }

  // Size of the array on 'up-down' axis.
  public get uSize(): number
  {
    return this.size.max.u - this.size.min.u;
  }

  // ---------------- Public methods --------------------

  // Reads from position [s, e, u].
  // -> Returns 'undefined' if item isn't in the array.
  public get(coords: Coords): T | "Nothing there"
  {
    const flooredCoords = coords.getFlooredCoords();

    const horizontalSlice = this.data.get(flooredCoords.u);

    if (horizontalSlice === undefined)
      return "Nothing there";

    const eastWestLine = horizontalSlice.get(flooredCoords.n);

    if (eastWestLine === undefined)
      return "Nothing there";

    const item = eastWestLine.get(flooredCoords.e);

    if (item === undefined)
      return "Nothing there";

    return item;
  }

  // Sets 'item' at position [e, n, u].
  public set(coords: Coords, item: T): void
  {
    const flooredCoords = coords.getFlooredCoords();
    let horizontalSlice = this.data.get(flooredCoords.u);

    if (horizontalSlice === undefined)
    {
      horizontalSlice = new Map<number, Map<number, T>>();

      this.data.set(flooredCoords.u, horizontalSlice);
    }

    let eastWestLine = horizontalSlice.get(flooredCoords.n);

    if (!eastWestLine)
    {
      eastWestLine = new Map<number, T>();
      horizontalSlice.set(flooredCoords.n, eastWestLine);
    }

    eastWestLine.set(flooredCoords.e, item);

    this.includeToGridSize(flooredCoords);
  }

  // ! Throws exception on error.
  // Deletes 'item' at position [e, n, u].
  //   Grid size is not changed by this operation because
  // it would be nontrivial operation.
  public delete(coords: Coords): void
  {
    const flooredCoords = coords.getFlooredCoords();

    const horizontalSlice = this.data.get(flooredCoords.u);

    if (horizontalSlice === undefined)
      throw failedToDelete(coords);

    const eastWestLine = horizontalSlice.get(flooredCoords.n);

    if (eastWestLine === undefined)
      throw failedToDelete(coords);

    if (!eastWestLine.delete(flooredCoords.e))
      throw failedToDelete(coords);
  }

  // ---------------- Private methods -------------------

  private includeToGridSize(coords: Coords): void
  {
    this.size.min = new Coords
    (
      this.size.min.e > coords.e ? coords.e : this.size.min.e,
      this.size.min.n > coords.n ? coords.n : this.size.min.n,
      this.size.min.u > coords.u ? coords.u : this.size.min.u
    );

    this.size.max = new Coords
    (
      this.size.max.e < coords.e ? coords.e : this.size.max.e,
      this.size.max.n < coords.n ? coords.n : this.size.max.n,
      this.size.max.u < coords.u ? coords.u : this.size.max.u
    );
  }
}

// ----------------- Auxiliary Functions ---------------------

function failedToDelete(coords: Coords): Error
{
  return new Error(`Failed to delete an item from the grid`
    + ` at coords ${coords.toString()} because it already`
    + ` wasn't there`);
}