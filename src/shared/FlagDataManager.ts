/*
  Part of BrutusNEXT

  Keeps track of what flag types (string names of flags) are awailable
  in different types of Flags objects.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {SaveableObject} from '../shared/SaveableObject';
import {Flags} from '../shared/Flags';
import {FlagData} from '../shared/FlagData';

export class FlagDataManager extends SaveableObject
{
  // Hashmap of <FlagsData> objects indexed by strings
  // (Flag object class names).
  private flagData = new Map();

  private loaded = false;
  // Do not save (and load) variable 'loaded'.
  private static loaded = { isSaved: false };

  private static get SAVE_DIRECTORY()
  {
    return "./data/";
  }

  private static get SAVE_FILE_NAME()
  {
    return "flagDataManager.json";
  }

  // ---------------- Public methods --------------------

  // Manager won't be loaded from disk.
  // (this is used when we are creating game from empty /data directory)
  public skipLoad()
  {
    this.loaded = true;
  }

  // Returns FlagsData object containing list of flag names that
  // can be set to flags object passed as parameter.
  //   Requested FlagsData object is created if it doesn't exist
  // and it's list of flag names is updated to contain all flag
  // names defined as static variables within parameter 'flags'.
  public getFlagsData(flags: Flags): FlagData
  {
    let saveNeeded = false;
    let flagsType = flags.className;

    if (!ASSERT(this.loaded === true,
        "Attempt to request FlagsData for class '" + flagsType + "'"
        + " before flagsDataManager is loaded. Make sure that you access"
        + " Flags objects only after flagsDataManager.load()"))
      return null;

    let flagsData = this.flagData.get(flagsType);

    // If requested FlagsData object doesn't exist, it will be created.
    if (flagsData === undefined)
    {
      flagsData = this.createFlagsData(flags);
      saveNeeded = true;
    }

    // If list of flag names in this FlagsData object hasn't been updated
    // in this boot yet, it will get updated.
    if (!flagsData.isAutoUpdated())
    {
      flagsData.updateFlags(flags);
      saveNeeded = true;
    }

    if (saveNeeded)
    {
      // Save flagsDataManage to file so the change is permanent.
      // (We don't need to wait for the save to complete here,
      //  so we don't need to use async/await.)
      this.save();
    }

    return flagsData;
  }

  public async save()
  {
    await this.saveToFile
    (
      FlagDataManager.SAVE_DIRECTORY,
      FlagDataManager.SAVE_FILE_NAME
    );
  }

  public async load()
  {
    let filePath = FlagDataManager.SAVE_DIRECTORY;
    let fileName = FlagDataManager.SAVE_FILE_NAME;
    let fullPath = filePath + fileName;

    ASSERT_FATAL(filePath.substr(filePath.length - 1) === '/',
      "filePath '" + filePath + "' doesn't end with '/'");

    await this.loadFromFile(fullPath);
  }

  // ---------------- Private methods -------------------

  private createFlagsData(flagsObject: Flags): FlagData
  {
    let key = flagsObject.className;
    let flagsData = new FlagData(flagsObject);

    // Add new FlagsData object to hashmap.
    this.flagData.set(key, flagsData);

    if (!ASSERT(flagsData !== undefined,
        "Failed to create FlagsData for class '" + key + "'"))
      return null;

    return flagsData;
  }
}