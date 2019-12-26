/*
  Part of BrutusNEXT

  Binary flags.
*/

// 3rd party modules.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FastBitSet = require("fastbitset");

interface Enum
{
  [id: number]: string
}

// T needs to be enum
// (there is no way to enforce it in Typescript at the moment).
export class Flags<T>
{
  private readonly flags = new FastBitSet();

  // ---------------- Public methods --------------------

  public set(flag: T): void
  {
    this.flags.add(flag);
  }

  public unset(flag: T): void
  {
    this.flags.remove(flag);
  }

  public flip(flag: T): void
  {
    this.flags.flip(flag);
  }

  public isSet(flag: T): boolean
  {
    return this.flags.has(flag);
  }
}