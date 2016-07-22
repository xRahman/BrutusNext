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
import {FlagsData} from '../shared/FlagsData';

export class FlagsDataManager extends SaveableObject
{
  // Hashmap of <FlagsData> objects indexed by strings
  // (Flag object class names).
  private flagsDataList = new Map();

  private loaded = false;
  // Do not save (and load) variable 'loaded'.
  private static loaded = { isSaved: false };

  private static get SAVE_DIRECTORY()
  {
    return "./data/flags/";
  }

  private static get SAVE_FILE_NAME()
  {
    return "flagsDataManager.json";
  }

  // ---------------- Public methods --------------------

  // Returns FlagsData object containing list of flag names that
  // can be set to flags object passed as parameter.
  //   Requested FlagsData object is created if it doesn't exist
  // and it's list of flag names is updated to contain all flag
  // names defined as static variables within parameter 'flags'.
  public getFlagsData(flags: Flags): FlagsData
  {
    let saveNeeded = false;
    let flagsType = flags.className;

    if (!ASSERT(this.loaded === true,
        "Attempt to request FlagsData for class '" + flagsType + "'"
        + " before flagsDataManager is loaded. Make sure that you access"
        + " Flags objects only after flagsDataManager.load()"))
      return null;

    let flagsData = this.flagsDataList.get(flagsType);

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
      FlagsDataManager.SAVE_DIRECTORY,
      FlagsDataManager.SAVE_FILE_NAME
    );
  }

  public async load()
  {
    let filePath = FlagsDataManager.SAVE_DIRECTORY;
    let fileName = FlagsDataManager.SAVE_FILE_NAME;
    let fullPath = filePath + fileName;

    ASSERT_FATAL(filePath.substr(filePath.length - 1) === '/',
      "filePath '" + filePath + "' doesn't end with '/'");

    await this.loadFromFile(fullPath);
  }

  // ---------------- Private methods -------------------

  private createFlagsData(flagsObject: Flags): FlagsData
  {
    let key = flagsObject.className;
    let flagsData = new FlagsData(flagsObject);

    // Add new FlagsData object to hashmap.
    this.flagsDataList.set(key, flagsData);

    if (!ASSERT(flagsData !== undefined,
        "Failed to create FlagsData for class '" + key + "'"))
      return null;

    return flagsData;
  }
}