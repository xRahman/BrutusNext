/*
  Part of BrutusNEXT

  Keeps track of what flag names are awailable for different types
  of Flags objects.
*/

/*
'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {AutoSaveableObject} from '../../../server/lib/fs/AutoSaveableObject';
import {Flags} from '../../../server/lib/flags/Flags';
import {FlagNames} from '../../../server/lib/flags/FlagNames';
import {ServerApp} from '../../../server/lib/Server';

export class FlagNamesManager extends AutoSaveableObject
{
  // Manager is ready to be used.
  public ready = false;
  // Do not save (and load) variable 'ready'.
  private static ready = { isSaved: false };

  // Hashmap<[ string, FlagNames ]>
  //   Key: name of class inherited from class Flags
  //   Value: FlagNames object
  private flagNamesList = new Map();

  private static get SAVE_DIRECTORY()
  {
    return ServerApp.DATA_DIRECTORY;
  }

  private static get SAVE_FILE_NAME()
  {
    return "FlagNamesManager.json";
  }

  // ---------------- Public methods --------------------

  // Returns FlagNames object containing list of flag names that
  // can be set to flags object passed as parameter.
  //   Requested FlagNames object is created if it doesn't exist
  // and its list of flag names is updated to contain all flag
  // names defined as static variables within parameter 'flags'.
  public getFlagNames(flags: Flags): FlagNames
  {
    let saveNeeded = false;
    let flagsType = flags.className;

    if (this.ready === false)
    {
      ERROR("Attempt to request FlagNames for class '" + flagsType + "'"
        + " before FlagNamesManager is loaded. Make sure that you access"
        + " Flags objects only after FlagNamesManager.load()");
      return null;
    }

    let flagNames = this.flagNamesList.get(flagsType);

    // If requested FlagNames object doesn't exist, it will be created.
    if (flagNames === undefined)
    {
      flagNames = this.createFlagNames(flags);
      saveNeeded = true;
    }

    // If list of flag names in this FlagNames object hasn't been updated
    // in this boot yet, it will get updated.
    if (!flagNames.isAutoUpdated())
    {
      flagNames.updateFlags(flags);
      saveNeeded = true;
    }

    if (saveNeeded)
    {
      // Save FlagNamesManager to file so the change is permanent.
      // (We don't need to wait for the save to complete here,
      //  so we don't need to use async/await.)
      this.save();
    }

    return flagNames;
  }

  // ---------------- Private methods -------------------

  private createFlagNames(flags: Flags): FlagNames
  {
    let key = flags.className;
    let flagNames = new FlagNames(flags);

    // Add new FlagNames object to hashmap.
    this.flagNamesList.set(key, flagNames);

    if (flagNames === undefined)
    {
      ERROR("Failed to create FlagNames for class '" + key + "'");
      return null;
    }

    return flagNames;
  }
}
*/