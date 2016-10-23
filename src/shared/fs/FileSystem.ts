/*
  Part of BrutusNEXT

  Wraps filesystem I/O operations.
*/

'use strict';

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
  public static async readFile(filePath: string)
  {
    let data = null;

    try
    {
      // Asynchronous reading from the file.
      // (the rest of the code will execute only after the reading is done)
      data = await promisifiedFS.readFile(filePath, FileSystem.FILE_ENCODING);
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
        "Unable to load file '" + filePath + "': " + reason,
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
  public static readFileSync(filePath: string)
  {
    let data = null;

    try
    {
      data = fs.readFileSync(filePath, FileSystem.FILE_ENCODING);
    }
    catch (error)
    {
      Syslog.log
      (
        "Unable to load file '" + filePath + "': " + error.code,
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
  public static async writeFile(filePath: string, data: string)
  {
    try
    {
      // Asynchronous saving to file.
      // (the rest of the code will execute only after the saving is done)
      await promisifiedFS.writeFile(filePath, data, FileSystem.FILE_ENCODING);
    }
    catch (error)
    {
      Syslog.log
      (
        "Unable to save file '" + filePath + "': " + error.code,
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
  public static async deleteFile(filePath: string)
  {
    try
    {
      await promisifiedFS.unlink(filePath);
    }
    catch (error)
    {
      Syslog.log
      (
        "Unable to delete file '" + filePath + "': " + error.code,
        Message.Type.SYSTEM_ERROR,
        AdminLevel.IMMORTAL
      );

      return false;
    }

    return true;
  }

  public static async exists(filePath: string)
  {
    return await promisifiedFS.exists(filePath);
  }

  public static existsSync(filePath: string)
  {
    return fs.existsSync(filePath);
  }

  // -> Returns 'true' if directory existed or was succesfully created.
  //    Returns 'false' otherwise. 
  public static async ensureDirectoryExists(directory: string)
  {
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

  // Directory is empty if it doesn't exist or there no files in it.
  // File is empty if it doesn't exist or it has zero size.
  public static async isEmpty(path: string)
  {
    ///return extfs.isEmptySync(path);
    return await promisifiedFS.isEmpty(path);
  }

  // Directory is empty if it doesn't exist or there no files in it.
  // File is empty if it doesn't exist or it has zero size.
  public static isEmptySync(path: string)
  {
    return extfs.isEmptySync(path);
  }
}