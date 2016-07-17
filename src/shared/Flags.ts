/*
  Part of BrutusNEXT

  Abstract ancestor for bitvectors.
*/

'use strict';

import {FlagsData} from '../shared/FlagsData';
import {SaveableObject} from '../shared/SaveableObject';

// 3rd party modules.
let FastBitSet = require('fastbitset');

export class Flags extends SaveableObject
{
  // FlagData object specifying what string values of flags are valid
  // for this Flags object and what numeric values they translate to.
  private flagData: FlagsData = null;

  // Bitvector to keep value of flags.
  private flags = new FastBitSet();

  public set(flagName: string)
  {
    let flagValue = this.flagData.getFlagValue(flagName);

    if (flagValue < 0)
      // Error messages were already handled by getFlagValue().
      return;

    this.flags.add(flagValue);
  }

  public unset(flagName: string)
  {
    let flagValue = this.flagData.getFlagValue(flagName);

    if (flagValue < 0)
      // Error messages were already handled by getFlagValue().
      return;

    this.flags.remove(flagValue);
  }

  public flip(flagName: string)
  {
    let flagValue = this.flagData.getFlagValue(flagName);

    if (flagValue < 0)
      // Error messages were already handled by getFlagValue().
      return;

    this.flags.flip(flagValue);
  }

  public isSet(flagName: string): boolean
  {
    let flagValue = this.flagData.getFlagValue(flagName);

    if (flagValue < 0)
      // Error messages were already handled by getFlagValue().
      return false; // Flag doesn't exist so it's definitely not set to true.

    return this.flags.has(flagValue);
  }
}
