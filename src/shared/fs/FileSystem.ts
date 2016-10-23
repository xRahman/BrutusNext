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
import * as fs from 'fs';  // Import namespace 'fs' from node.js

// 3rd party modules.
let promisifiedFS = require('fs-promise');
let extfs = require('extfs');

export class FileSystem
{
  private static get FILE_ENCODING() { return 'utf8'; }

  // -> Returns null if file could not be read.
  public static async readFile(path: string)
  {
    if (!FileSystem.isPathRelative(path))
      return null;

    let data = null;

    try
    {
      // Asynchronous reading from the file.
      // (the rest of the code will execute only after the reading is done)
      data = await promisifiedFS.readFile
      (
        ///'"' + path + '"',
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

      /*
      // Throw the exception so the mud will get terminated with error
      // message.
      // (Create a new Error object, because the one we have cought here
      // doesn't contain stack trace.)
      throw new Error;
      */

      return null;
    }

    return data;
  }

  // -> Returns null if file could not be read.
  public static readFileSync(path: string)
  {
    if (!FileSystem.isPathRelative(path))
      return null;

    let data = null;

    try
    {
      data = fs.readFileSync
      (
        ///'"' + path + '"',
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

      /*
      // Throw the exception so the mud will get terminated with error
      // message.
      // (Create a new Error object, because the one we have cought here
      // doesn't contain stack trace.)
      throw new Error;
      */

      return null;
    }

    return data;
  }

  // -> Returns 'true' if file was succesfully written.
  //    Returns 'false' otherwise.
  public static async writeFile(path: string, data: string)
  {
    if (!FileSystem.isPathRelative(path))
      return false;

    try
    {
      // Asynchronous saving to file.
      // (the rest of the code will execute only after the saving is done)
      await promisifiedFS.writeFile
      (
        ///'"' + path + '"',
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

      /*
      // Throw the exception so the mud will get terminated with error
      // message.
      // (create a new Error object, because the one we have cought here
      // doesn't contain stack trace)
      throw new Error;
      */

      return false;
    }

    return true;
  }

  // -> Returns 'true' if file was succesfully deleted.
  //    Returns 'false' otherwise.
  public static async deleteFile(path: string)
  {
    if (!FileSystem.isPathRelative(path))
      return false;

    try
    {
      ///await promisifiedFS.unlink('"' + path + '"');
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

  public static async exists(path: string)
  {
    if (!FileSystem.isPathRelative(path))
      return false;

    ///return await promisifiedFS.exists('"' + path + '"');
    return await promisifiedFS.exists(path);
  }

  public static existsSync(path: string)
  {
    if (!FileSystem.isPathRelative(path))
      return false;

    ///return fs.existsSync('"' + path + '"');
    return fs.existsSync(path);
  }

  // -> Returns 'true' if directory existed or was succesfully created.
  //    Returns 'false' otherwise. 
  public static async ensureDirectoryExists(directory: string)
  {
    if (!FileSystem.isPathRelative(directory))
      return false;

    try
    {
      //await promisifiedFS.ensureDir('"' + directory + '"');
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

  // Directory is empty if it doesn't exist or there no files in it.
  // File is empty if it doesn't exist or it has zero size.
  public static async isEmpty(path: string)
  {
    if (!FileSystem.isPathRelative(path))
      return false;

    ///return await promisifiedFS.isEmpty('"' + path + '"');
    return await promisifiedFS.isEmpty(path);
  }

  // Directory is empty if it doesn't exist or there no files in it.
  // File is empty if it doesn't exist or it has zero size.
  public static isEmptySync(path: string)
  {
    if (!FileSystem.isPathRelative(path))
      return false;

    ///return extfs.isEmptySync('"' + path + '"');
    return extfs.isEmptySync(path);
  }

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
}