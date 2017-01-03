/*
  Part of BrutusNEXT

  Wraps filesystem I/O operations.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {Syslog} from '../../server/Syslog';
import {AdminLevel} from '../../server/AdminLevel';
import {Message} from '../../server/message/Message';

// Built-in node.js modules.
import * as fs from 'fs';

// 3rd party modules.
let promisifiedFS = require('fs-promise');
let extfs = require('extfs');

export class FileSystem
{
  private static get FILE_ENCODING() { return 'utf8'; }

  public static get JSON_EXTENSION() { return '.json'; }

  // ---------------- Public methods -------------------- 

  // -> Returns data read from file, 'null' if file could not be read.
  public static async readFile(path: string): Promise<any>
  {
    if (!FileSystem.isPathRelative(path))
      return null;

    let data = null;

    try
    {
      data = await promisifiedFS.readFile
      (
        path,
        FileSystem.FILE_ENCODING
      );
    }
    catch (error)
    {
      let reason = error.code;

      // Let's be more specific - we are trying to load file so ENOENT
      // means that file doesn't exist.
      if (error.code === 'ENOENT')
        reason = "File doesn't exist"

      Syslog.log
      (
        "Unable to load file '" + path + "': " + reason,
        Message.Type.SYSTEM_ERROR,
        AdminLevel.IMMORTAL
      );

      return null;
    }

    return data;
  }

  // -> Returns data read from file, 'null' if file could not be read.
  public static readFileSync(path: string): any
  {
    if (!FileSystem.isPathRelative(path))
      return null;

    let data = null;

    try
    {
      data = fs.readFileSync
      (
        path,
        FileSystem.FILE_ENCODING
      );
    }
    catch (error)
    {
      Syslog.log
      (
        "Unable to load file '" + path + "': " + error.code,
        Message.Type.SYSTEM_ERROR,
        AdminLevel.IMMORTAL
      );

      return null;
    }

    return data;
  }

  // -> Returns 'true' if file was succesfully written.
  public static async writeFile(path: string, data: string): Promise<boolean>
  {
    if (!FileSystem.isPathRelative(path))
      return false;

    try
    {
      await promisifiedFS.writeFile
      (
        path,
        data,
        FileSystem.FILE_ENCODING
      );
    }
    catch (error)
    {
      Syslog.log
      (
        "Unable to save file '" + path + "': " + error.code,
        Message.Type.SYSTEM_ERROR,
        AdminLevel.IMMORTAL
      );

      return false;
    }

    return true;
  }

  // -> Returns 'true' if file was succesfully deleted.
  public static async deleteFile(path: string): Promise<boolean>
  {
    if (!FileSystem.isPathRelative(path))
      return false;

    try
    {
      await promisifiedFS.unlink(path);
    }
    catch (error)
    {
      Syslog.log
      (
        "Unable to delete file '" + path + "': " + error.code,
        Message.Type.SYSTEM_ERROR,
        AdminLevel.IMMORTAL
      );

      return false;
    }

    return true;
  }

  // -> Returns 'true' if file exists.
  public static async exists(path: string): Promise<boolean>
  {
    if (!FileSystem.isPathRelative(path))
      return false;

    return await promisifiedFS.exists(path);
  }

  // -> Returns 'true' if file exists.
  public static existsSync(path: string): boolean
  {
    if (!FileSystem.isPathRelative(path))
      return false;

    return fs.existsSync(path);
  }

  // -> Returns 'true' if directory was succesfully created or if it already
  //    existed.
  public static async ensureDirectoryExists(directory: string)
  : Promise<boolean>
  {
    if (!FileSystem.isPathRelative(directory))
      return false;

    try
    {
      await promisifiedFS.ensureDir(directory);
    }
    catch (error)
    {
      Syslog.log
      (
        "Unable to ensure existence of directory '" + directory + "':"
        + " " + error.code,
        Message.Type.SYSTEM_ERROR,
        AdminLevel.IMMORTAL
      );

      return false;
    }

    return true;
  }

  // -> Returns 'true' if file or directory is empty.
  //    Directory is empty if it doesn't exist or there are no files in it.
  //    File is empty if it doesn't exist or it has zero size.
  public static async isEmpty(path: string): Promise<boolean>
  {
    if (!FileSystem.isPathRelative(path))
      return false;

    return await promisifiedFS.isEmpty(path);
  }

  // -> Returns 'true' if file or directory is empty.
  //    Directory is empty if it doesn't exist or there no files in it.
  //    File is empty if it doesn't exist or it has zero size.
  public static isEmptySync(path: string): boolean
  {
    if (!FileSystem.isPathRelative(path))
      return false;

    return extfs.isEmptySync(path);
  }

  // -> Returns array of file names in directory, including
  //    subdirectories, excluding '.' and '..'.
  //    Returns 'null' on error.
  public static async readDirectoryContents(path: string)
  : Promise<Array<string>>
  {
    if (!FileSystem.isPathRelative(path))
      return null;

    let fileNames = null;

    try
    {
      fileNames = promisifiedFS.readdir(path);
    }
    catch (error)
    {
      Syslog.log
      (
        "Unable to read directory '" + path + "':"
        + " " + error.code,
        Message.Type.SYSTEM_ERROR,
        AdminLevel.IMMORTAL
      );

      return null;
    }

    return fileNames;
  }

  // -> Returns 'false' if 'path' is not a directory or an error occured.
  public static async isDirectory(path: string): Promise<boolean>
  {
    if (!FileSystem.isPathRelative(path))
      return false;

    let fileStats = await FileSystem.statFile(path);

    if (fileStats === null)
      return false;

    return fileStats.isDirectory();
  }

  // -> Returns 'false' if 'path' is not a file or an error occured.
  public static async isFile(path: string): Promise<boolean>
  {
    if (!FileSystem.isPathRelative(path))
      return false;

    let fileStats = await FileSystem.statFile(path);

    if (fileStats === null)
      return false;

    return fileStats.isFile();
  }

  // ---------------- Private methods ------------------- 

  // -> Returns 'true' if 'path' begins with './'.
  private static isPathRelative(path: string): boolean
  {
    if (path.substr(0, 2) !== './')
    {
      ERROR("File path '" + path + "' is not relative."
        + " Ensure that it starts with './'");
      return false;
    }

    return true;
  }

  // -> Returns 'fs.Stats' object describing specified file.
  //    Returns 'null' on error.
  private static async statFile(path: string): Promise<fs.Stats>
  {
    if (!FileSystem.isPathRelative(path))
      return null;

    let fileStats = null;

    try
    {
      fileStats = promisifiedFS.stat(path);
    }
    catch (error)
    {
      Syslog.log
      (
        "Unable to stat file '" + path + "':"
        + " " + error.code,
        Message.Type.SYSTEM_ERROR,
        AdminLevel.IMMORTAL
      );

      return null;
    }

    return fileStats;
  }
}