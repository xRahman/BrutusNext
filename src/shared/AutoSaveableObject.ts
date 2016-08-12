/*
  Part of BrutusNEXT

  Extends SaveableObject with save() and load() methods.
*/

/*
  Save file location is read from static variables 'SAVE_DIRECTORY'
  and 'SAVE_FILE_NAME'.
  
  You can also extend methods getSaveDirectory() and getSaveFileName()
  to create path and filename dynamically.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {SaveableObject} from '../shared/SaveableObject';
import {FileSystem} from '../shared/fs/FileSystem';

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

  public saveExists(): boolean
  {
    return FileSystem.existsSync(this.getFullSavePath());    
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
      // If static variable SAVE_DIRECTORY is missing,, data will be saved
      // to directory './data/_MISSING_SAVE_DIRECTORY_ERROR'.
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
      // If static variable SAVE_FILE_NAME is missing, data will be saved
      // to file '_MISSING_SAVE_FILE_NAME_'.
      return "_MISSING_SAVE_FILE_NAME_" + this.className + ".json";
    }

    return saveFileName;
  }

  protected getFullSavePath(): string
  {
    let directory = this.getSaveDirectory();
    let fileName = this.getSaveFileName();
    let fullPath = directory + fileName;

    if (!ASSERT(directory.substr(directory.length - 1) === '/',
      "Directory path '" + directory + "' doesn't end with '/'."
      + "The '/' is added automatically, but it should be fixed anyways"))
    {
      return this.getSaveDirectory() + '/' + this.getSaveFileName();
    }

    return this.getSaveDirectory() + this.getSaveFileName();
  }
}