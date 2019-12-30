/*
  Part of BrutusNEXT

  Associative 3d array indexed by [e, s, u] coordinates
*/

/*
  Notes:
    Math.floor() is used on all input coordiantes - it means that
    item inserted on [0.3, 0, 0] will actualy be put on [0, 0, 0].

    Grid is associative - it means that you can use negative indexes,
    it can have holes and you can use negative indexes.

    But it also means that items are not sorted by coordinates but
    rather by order of insertion.
*/

import { Coords } from "../../Shared/Class/Coords";

export class Grid<T>
{
  // -------------- Static class data -------------------

  // ---------------- Protected data --------------------

  // ----------------- Private data ---------------------

  private readonly data = new Map<number, Map<number, Map<number, T>>>();

  // Point in array with smallest 'e', 's' and 'u'
  private min = new Coords();
  // Point in array with largest 'e', 's' and 'u'.
  private max = new Coords();

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // Size of the array on 'e-w' axis.
  public get length(): number { return this.max.e - this.min.e; }
  // Size of the array on 'n-s' axis.
  public get width(): number { return this.max.s - this.min.s; }
  // Size of the array on 'u-d' axis.
  public get height(): number { return this.max.u - this.min.u; }

  // ---------------- Public methods --------------------

  // Reads from position [s, e, u].
  // -> Returns 'undefined' if item isn't in the array.
  public get(coords: Coords): T | "Nothing there"
  {
    const flooredCoords = coords.getFlooredCoords();

    const horizontalSlice = this.data.get(flooredCoords.u);

    if (horizontalSlice === undefined)
      return "Nothing there";

    const eastWestLine = horizontalSlice.get(flooredCoords.s);

    if (eastWestLine === undefined)
      return "Nothing there";

    const item = eastWestLine.get(flooredCoords.e);

    if (item === undefined)
      return "Nothing there";

    return item;
  }

  // Sets 'item' at position [e, s, u].
  public set(coords: Coords, item: T): void
  {
    const flooredCoords = coords.getFlooredCoords();
    let horizontalSlice = this.data.get(flooredCoords.u);

    if (horizontalSlice === undefined)
    {
      horizontalSlice = new Map<number, Map<number, T>>();

      this.data.set(flooredCoords.u, horizontalSlice);
    }

    let eastWestLine = horizontalSlice.get(flooredCoords.s);

    if (!eastWestLine)
    {
      eastWestLine = new Map<number, T>();
      horizontalSlice.set(flooredCoords.s, eastWestLine);
    }

    eastWestLine.set(flooredCoords.e, item);

    this.includeToGridSize(flooredCoords);
  }

  // ! Throws exception on error.
  // Deletes 'item' at position [e, s, u].
  // Grid size is not changed by this operation so it might be
  // bigger than necessary afterwards.
  public delete(coords: Coords): void
  {
    const flooredCoords = coords.getFlooredCoords();

    const horizontalSlice = this.data.get(flooredCoords.u);

    if (horizontalSlice === undefined)
      throw failedToDelete(coords);

    const eastWestLine = horizontalSlice.get(flooredCoords.s);

    if (eastWestLine === undefined)
      throw failedToDelete(coords);

    if (!eastWestLine.delete(flooredCoords.e))
      throw failedToDelete(coords);
  }

  /// This works (hopefuly) but it's not needed after all.
  // public getItemsInDepth(depth: number): Array<T>
  // {
  //   const items: Array<T> = [];

  //   const horizontalSlice = this.data.get(Math.floor(depth));

  //   if (horizontalSlice === undefined)
  //     return items;

  //   for (const eastWestLine of horizontalSlice.values())
  //   {
  //     for (const item of eastWestLine.values())
  //     {
  //       items.push(item);
  //     }
  //   }

  //   return items;
  // }

  /// This works (hopefuly) but it's not needed after all.
  // public getHorizontalSlice
  // (
  //   depth: number
  // )
  // : Map<number, Map<number, T>> | "Nothing there"
  // {
  //   const horizontalSlice = this.data.get(Math.floor(depth));

  //   if (horizontalSlice === undefined)
  //     return "Nothing there";

  //   return horizontalSlice;
  // }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private includeToGridSize(coords: Coords): void
  {
    if (this.min.e > coords.e)
      this.min.e = coords.e;

    if (this.min.s > coords.s)
      this.min.s = coords.s;

    if (this.min.u > coords.u)
      this.min.u = coords.u;

    if (this.max.e < coords.e)
      this.max.e = coords.e;

    if (this.max.s < coords.s)
      this.max.s = coords.s;

    if (this.max.u < coords.u)
      this.max.u = coords.u;
  }
}

// ----------------- Auxiliary Functions ---------------------

function failedToDelete(coords: Coords): Error
{
  return new Error(`Failed to delete an item from the grid`
    + ` at coords ${coords.toString()} because it already`
    + ` wasn't there`);
}