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

import {ERROR} from '../../../server/lib/error/ERROR';
import {SaveableObject} from '../../../server/lib/fs/SaveableObject';
import {FileSystem} from '../../../server/lib/fs/FileSystem';
import {Server} from '../../../server/lib/Server';

export abstract class AutoSaveableObject extends SaveableObject
{
  // ---------------- Public methods --------------------
  
  public async save()
  {
    let directory = this.getSaveDirectory();
    let fileName = this.getSaveFileName();

    if (directory === null || fileName === null)
      return;

    await this.saveToFile(directory, fileName);
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

    if (saveDirectory === undefined)
    {
      ERROR("Missing static SAVE_DIRECTORY property"
        + " on class " + this.className);

      // If static variable SAVE_DIRECTORY is missing,, data will be saved
      // to directory './server/data/_MISSING_SAVE_DIRECTORY_ERROR'.
      return Server.DATA_DIRECTORY + "_MISSING_SAVE_DIRECTORY_ERROR";
    }

    return saveDirectory
  }

  /// TODO: Až p?ed?lám strukturu sav?/load?, tak zkontrolovat,
  /// jestli je static SAVE_FILE_NAME pot?eba (ale asi jo,
  /// protože n?které classy jsou zd?d?né ze SaveableObjectu,
  /// ale nejsou to Entity (t?eba r?zné managery).
  protected getSaveFileName(): string
  {
    // This trick dynamically accesses static class variable.
    // (so it's the same as AutoSaveableOcject.SAVE_FILE_NAME,
    //  but when this method is called from for example Room,
    //  it will mean Room.SAVE_FILE_NAME)
    let saveFileName = this.constructor['SAVE_FILE_NAME'];

    if (saveFileName === undefined)
    {
      ERROR("Missing static SAVE_FILE_NAME property"
        + " on class " + this.className);

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

    if (directory.substr(directory.length - 1) !== '/')
    {
      ERROR("Directory path '" + directory + "' doesn't end with '/'."
        + "The '/' is added automatically, but it should be fixed anyways");
      return this.getSaveDirectory() + '/' + this.getSaveFileName();
    }

    return this.getSaveDirectory() + this.getSaveFileName();
  }
}