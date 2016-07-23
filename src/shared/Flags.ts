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
    // getOwnPropertyNames() returns all properties, including nonenumerables.
    // (We need to use it because accessors are not listed by 'in' operator.)
    let staticPropertyNames = Object.getOwnPropertyNames(this.constructor);

    // This trick iterates over static class properties of this object.
    for (let i = 0; i < staticPropertyNames.length; i++)
    {
      let property = this.constructor[staticPropertyNames[i]];

      // Only add string properties as new flag names.
      // Also skip property 'name', which is always se on this.constructor
      // by javascript itself.
      if (staticPropertyNames[i] !== 'name' && typeof property === 'string')
        result.push(property);
    }

    return result;
  }

  // -------------- Protected methods -------------------

  // Overrides SaveableObject::loadPropertyFromJsonObject() to
  // be able save bitvector as array of numbers.
  protected loadPropertyFromJsonObject
  (
    jsonObject: Object,
    property: string,
    filePath: string
  )
  {
    if (property === 'flags')
    {
      // Flags are saved as array of numbers. Bitvector is recreated
      // by passing this array to constructor.
      this[property] = new FastBitSet(jsonObject[property]);
    }
    else
    {
      super.loadPropertyFromJsonObject(jsonObject, property, filePath);
    }
  }

  // Overrides SaveableObject::loadPropertyFromJsonObject() to
  // be able load bitvector from array of numbers.
  protected savePropertyToJsonObject(jsonObject: Object, property: string)
  {
    if (property === 'flags')
    {
      // Save bitvector as array of numbers.
      jsonObject[property] = this.flags.array();
    }
    else
    {
      super.savePropertyToJsonObject(jsonObject, property);
    }
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
