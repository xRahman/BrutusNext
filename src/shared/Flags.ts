/*
  Part of BrutusNEXT

  Abstract ancestor for bitvectors.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {FlagsData} from '../shared/FlagsData';
import {SaveableObject} from '../shared/SaveableObject';
import {Server} from '../server/Server';

// 3rd party modules.
let FastBitSet = require('fastbitset');

export abstract class Flags extends SaveableObject
{
  // DO NOT ACCESS THIS VARIABLE DIRECTLY, use this.getFlagsData().
  //   FlagData object specifying what string values of flags can be set
  // to this Flags object and what numeric values they translate to.
  // (This reference is automaticaly acquired the first time you
  //  use this.getFlagsData()).
  private flagsData: FlagsData = null;

  // Bitvector to track which flags are set.
  private flags = new FastBitSet();

  // ---------------- Public methods --------------------

  // Adds a new name to the list of flags that can be set
  // to this object.
  public addFlag(flagName: string)
  {
    let result = this.getFlagsData().updateFlag(flagName);

    if (result.saveNeeded)
      Server.flagsDataManager.save();
  }

  // Sets value of specified flag to true.
  public set(flagName: string)
  {
    let flagValue = this.getFlagsData().getFlagValue(flagName);

    if (flagValue < 0)
      // Error messages were already handled by getFlagValue().
      return;

    this.flags.add(flagValue);
  }

  // Sets value of specified flag to true.
  public unset(flagName: string)
  {
    let flagValue = this.getFlagsData().getFlagValue(flagName);

    if (flagValue < 0)
      // Error messages were already handled by getFlagValue().
      return;

    this.flags.remove(flagValue);
  }

  // Sets value of specified flag to it's logical negation.
  public flip(flagName: string)
  {
    let flagValue = this.getFlagsData().getFlagValue(flagName);

    if (flagValue < 0)
      // Error messages were already handled by getFlagValue().
      return;

    this.flags.flip(flagValue);
  }

  public isSet(flagName: string): boolean
  {
    let flagValue = this.getFlagsData().getFlagValue(flagName);

    if (flagValue < 0)
      // Error messages were already handled by getFlagValue().
      return false; // Flag doesn't exist so it's definitely not set to true.

    return this.flags.has(flagValue);
  }

  // This method is used by FlagsData::updateFlagNames() to retrieve
  // list of flag symbolic constants.
  public getStaticFlagNames(): Array<string>
  {
    let result = new Array<string>();
    let flagPrefix = this.constructor['prefix'];

    ASSERT
    (
      flagPrefix !== undefined,
      "Static 'prefix' property is missing in class " + this.className + "."
      + " All Flags objects need to have required flag prefix declared as"
      + " static property called 'prefix'"
    );

    // This trick iterates over static class properties of this object.
    for (let property in this.constructor)
    {
      // Here we grab the number of characters equal to the length of
      // prefix each flag name should have from the start of the string.
      let propertyPrefix = property.substr(0, flagPrefix.length);

      // So we can compare that property name realy starts with required
      // flag prefix. If it doesn't it's not a flag name and so it won't
      // be added as such.
      if (property !== 'prefix' && propertyPrefix === flagPrefix)
      {
        // While we are at it, we can as well check if declared
        // flag names really match their symbolic (property) names.
        ASSERT
        (
          property === this.constructor[property],
          "Property '" + property + "' in class " + this.className
          + " has incorrect value (" + this.constructor[property] + ")."
          + " It needs to be the same as the name of the property"
        );

        result.push(property);
      }
    }

    return result;
  }

  // ---------------- Private methods --------------------

  private getFlagsData()
  {
    if (this.flagsData === null)
    {
      // This also updates corresponding FlagsData object with flag types
      // (names of the flags) declared as static variables within this
      // class. So if you have for example class RoomFlags extends Flags
      // and you declare public static get ROOM_HOT() { return 'ROOM_HOT'; },
      // 'ROOM_HOT' is automaticaly added to respective FlagsData object
      // here (so you don't have to manualy edit file where flag names are
      // saved).
      this.flagsData = Server.flagsDataManager.getFlagsData(this);
    }

    return this.flagsData;
  }
}
