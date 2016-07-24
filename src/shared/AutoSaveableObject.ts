/*
  Part of BrutusNEXT

  Extends SaveableObject with save() and load() methods.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {SaveableObject} from '../shared/SaveableObject';

export abstract class AutoSaveableObject extends SaveableObject
{
  // ---------------- Public methods --------------------
  
  public async save()
  {
    await this.saveToFile(this.getSaveDirectory(), this.getSaveFileName());
  }

  public async load()
  {
    await this.loadFromFile(this.getFullSavePath());
  }

  // --------------- Protected methods ------------------

  protected getSaveDirectory(): string
  {
    // This trick dynamically accesses static class variable.
    // (so it's the same as AutoSaveableOcject.SAVE_DIRECTORY,
    //  but when this method is called from for example Room,
    //  it will mean Room.SAVE_DIRECTORY)
    let saveDirectory = this.constructor['SAVE_DIRECTORY'];

    if (!ASSERT(saveDirectory !== undefined,
        "Missing static SAVE_DIRECTORY property on class " + this.className))
    {
      // When this happen, data will be saved to
      // ./data/_MISSING_SAVE_DIRECTORY_ERROR
      return "./data/_MISSING_SAVE_DIRECTORY_ERROR";
    }

    return saveDirectory
  }

  protected getSaveFileName(): string
  {
    // This trick dynamically accesses static class variable.
    // (so it's the same as AutoSaveableOcject.SAVE_FILE_NAME,
    //  but when this method is called from for example Room,
    //  it will mean Room.SAVE_FILE_NAME)
    let saveFileName = this.constructor['SAVE_FILE_NAME'];

    if (!ASSERT(saveFileName !== undefined,
      "Missing static SAVE_FILE_NAME property on class " + this.className))
    {
      return "_MISSING_SAVE_FILE_NAME_" + this.className + ".json";
    }

    return saveFileName;
  }

  protected getFullSavePath(): string
  {
    let directory = this.getSaveDirectory();
    let fileName = this.getSaveFileName();
    let fullPath = directory + fileName;

    ASSERT_FATAL(directory.substr(directory.length - 1) === '/',
      "Directory path '" + directory + "' doesn't end with '/'");

    return this.getSaveDirectory() + this.getSaveFileName();
  }
}