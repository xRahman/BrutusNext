/*
  Part of BrutusNEXT

  Abstract ancestor for bitvectors.
*/

'use strict';

// 3rd party modules.
let FastBitSet = require('fastbitset');

// T needs to be enum (there is no way to enforce it at the moment
// in typescript).
//   See RoomData.flags and RoomData.Flags for example.
export class Flags<T>
{

  // Bitvector to track which flags are set.
  private flags = new FastBitSet();

  // ---------------- Public methods --------------------

  // Sets value of the specified flag to 'true'.
  public set(flag: T)
  {
    this.flags.add(flag);
  }

  // Sets value of the specified flag to 'false'.
  public unset(flag: T)
  {
    this.flags.remove(flag);
  }

  // Sets value of specified flag to it's logical negation.
  public flip(flag: T)
  {
    this.flags.flip(flag);
  }

  public isSet(flag: T): boolean
  {
    return this.flags.has(flag);
  }
}
