/*
  Part of BrutusNEXT

  List of flag names that can be set to a flag object of specific type.
*/

/*
  Note:
    New flags can be added dynamically (from scripts) using
  Flags::addFlag(flagName).
*/

/*
'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Flags} from '../../../server/lib/flags/Flags';
import {SaveableObject} from '../../../server/lib/fs/SaveableObject';
import {Classes} from '../../../shared/lib/Classes';

export class FlagNames extends SaveableObject
{
  // What type of flags does this list belong to (e. g. RoomFlags).
  // (Value is name of the class of respective Flags object.)
  private flagsType: string = null;

  // Hashmap<[ string, number ]>
  //   Key: flag name
  //   Value: flag integer value
  private flagValues = new Map();

  // This flag is set to true the first time
  private flagsAutoUpdated = false;
  // Do not save (and load) variable 'flagsAutoUpdated'.
  private static flagsAutoUpdated = { isSaved: false };

  constructor(flags: Flags)
  {
    super();

    // This will be skipped when loading from file, but that's ok because
    // these values will be overwritten by those in the file anyways.
    if (flags !== undefined)
      this.flagsType = flags.className;
  }

  // ---------------- Public methods --------------------

  public isAutoUpdated()
  {
    return this.flagsAutoUpdated;
  }

  public updateFlags(flagsObject: Flags): { saveNeeded: boolean }
  {
    let result = { saveNeeded: false };

    // Prevent updating again.
    // (Flag names defined in code are updated here so it doesn't make
    //  sense to update them more then once per boot).
    this.flagsAutoUpdated = true;

    let flagNamesList = flagsObject.getStaticFlagNames();

    for (let i = 0; i < flagNamesList.length; i++)
    {
      let partialResult = this.updateFlag(flagNamesList[i]);

      if (partialResult.saveNeeded === true)
        result.saveNeeded = true;
    }

    return result;
  }

  // If flag with this name doesn't exist yet, it will be added
  // to the list.
  public updateFlag(flagName: string): { saveNeeded: boolean }
  {
    let result = { saveNeeded: false };

    if (!this.flagValues.has(flagName))
    {
      this.addFlag(flagName);
      result.saveNeeded = true;
    }

    return result;
  }

  // Returns flag value (number) for a given flag name.
  // (Returns -1 if such flag doesn't exist on this type of flags.)
  // Note:
  //   This method is called automatically when you access a Flags object.
  public getFlagValue(flagName: string): number
  {
    let flagValue = this.flagValues.get(flagName);

    if (flagValue === undefined)
    {
      ERROR("Attempt to get value of flag type '" + flagName + "' which"
        + "  doesn't exist in FlagData of of " + this.flagsType);
      return -1;
    }

    return flagValue;
  }

  // ---------------- Private methods --------------------

  private addFlag(flagName: string)
  {
    // flagValuesList.get() returns undefined if flag doesn't exist.
    let flagValue = this.flagValues.get(flagName);

    // Check that such flag doesn't exist yet.    
    if (flagValue !== undefined)
    {
      ERROR("Attempt to add flag type '" + flagName + "' to"
        + " FlagsData of " + this.flagsType + "which already"
        + " contains it");
      return;
    }

    // Determine free value for a new flag.
    // (There may be 'holes' if for example someone deletes a deprecated
    //  flag value. Here we find the first such hole.)
    let newFlagValue = this.getFirstFreeFlagValue();

    // Add record to hashmap.
    this.flagValues.set(flagName, newFlagValue);
  }

  private getFirstFreeFlagValue(): number
  {
    // Temporary array of size equal to the number of used flag values.
    // (It is possible that we will index beyond this size, but this helps
    // node.js to prealocate memeory - we know we are going to need at least
    // this much),
    let usedFlagValues = new Array(this.flagValues.size);

    for (var value of this.flagValues.values())
    {
      // Here we translate actual flag values to indexes of temporary array.
      usedFlagValues[value] = 1;
    }

    // '<= size' instead of '< size'  because it is possible that all indexes
    // within the array are used so first free index will be equal to the
    // length of this array.
    for (let i = 0; i <= usedFlagValues.length; i++)
    {
      // Check if index 'i' exists in the array.
      if (!(i in usedFlagValues))
      {
        // We have found our first free index, no need to iterate more.
        return i;
      }
    }
  }
}

Classes.registerSerializableClass(FlagNames);
*/