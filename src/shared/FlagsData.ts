/*
  Part of BrutusNEXT

  List of flag names that can be set to a flag object of specific type.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {SaveableObject} from '../shared/SaveableObject';

export class FlagsData extends SaveableObject
{
  // Prefix all flags of this type must begin with (it is checked when adding
  // new flag values).
  private prefix: string = null;

  // What type of flags does this list belong to (e. g. RoomFlags).
  // (Value is name of the class of respective Flags object.)
  private flagsType: string = "";

  // Hashmap, because we will access flag values using flag names (strings).
  private flagValues = new Map();

  public addFlagType(flagName: string)
  {
    let flagNamePrefix = flagName.substr(0, this.prefix.length);

    // Check that flagName starts with this.prefix.
    if (!ASSERT(flagNamePrefix === this.prefix,
        "Attempt to add a new flag type '" + flagName + "' to"
        + " FlagsData of " + this.flagsType + " that has an"
        + " incorrect prefix (should be '" + this.prefix + "'."
        + " Flag type is not added"))
      return;

    // Check that such flag doesn't exist yet.

    // get() will return undefined if flag doesn't exist.
    let flagValue = this.flagValues.get(flagName);
    
    if (!ASSERT(flagValue === undefined,
        "Attempt to add flag type '" + flagName + "' to"
        + " FlagsData of " + this.flagsType + "which already"
        + " contains it"))
      return;

    // Determine the next free value for a new flag.
    let newFlagValue = this.flagValues.size;

    // Check that this value doesn't exist in hashmap yet.
    // (This is not really needed and it's quite time-consuming
    // because whole hashmap will be iterated, but we can afford
    // to do it because new flag values are only added occasionally.)
    // (Better be sure than sorry.)
    for (var value of this.flagValues.values())
    {
      if (!ASSERT(value !== newFlagValue,
          "Broken FlagsData of " + this.flagsType + ". It already contains"
          + " value '" + newFlagValue + "' which is equal to the number of"
          + " flag types. That is not supposed to happen. Flag type is not"
          + " added"))
        return;
    }

    // Add record to hashmap.
    this.flagValues.set(flagName, newFlagValue);
  }

  // Returns FlagValue object for a given flag name.
  // (Returns -1 if such flag doesn't exist on this type of flags.)
  // Note:
  //   This method is called automatically when you access a Flags object.
  // You don't have to do the translation manually.
  public getFlagValue(flagName: string): number
  {
    let flagValue = this.flagValues.get(flagName);

    if (!ASSERT(flagValue !== undefined,
        "Attempt to get value of flag type '" + flagName + "' which doesn't"
        + " exist in FlagData of of " + this.flagsType))
      return -1;

    return flagValue;
  }
}
