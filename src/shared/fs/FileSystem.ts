/*
  Part of BrutusNEXT

  Wraps filesystem I/O operations.
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT';
import {ASSERT_FATAL} from '../../shared/ASSERT';
import {Mudlog} from '../../server/Mudlog';
import {AdminLevels} from '../../server/AdminLevels';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

// 3rd party modules.
let promisifiedFS = require('fs-promise');
let extfs = require('extfs');

export class FileSystem
{
  static get FILE_ENCODING() { return 'utf8'; }

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
      Mudlog.log
      (
        "Error loading file '" + filePath + "': " + error.code,
        Mudlog.msgType.SYSTEM_ERROR,
        AdminLevels.IMMORTAL
      );

      // Throw the exception so the mud will get terminated with error
      // message.
      // (Create a new Error object, because the one we have cought here
      // doesn't contain stack trace.)
      throw new Error;
    }

    return data;
  }

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
      Mudlog.log
      (
        "Error saving file '" + filePath + "': " + error.code,
        Mudlog.msgType.SYSTEM_ERROR,
        AdminLevels.IMMORTAL
      );

      // Throw the exception so the mud will get terminated with error
      // message.
      // (Create a new Error object, because the one we have cought here
      // doesn't contain stack trace.)
      throw new Error;
    }
  }

  public static readFileSync(filePath: string)
  {
    let data = null;

    try
    {
      data = fs.readFileSync(filePath, FileSystem.FILE_ENCODING);
    }
    catch (error)
    {
      Mudlog.log
      (
        "Error loading file '" + filePath + "': " + error.code,
        Mudlog.msgType.SYSTEM_ERROR,
        AdminLevels.IMMORTAL
      );

      // Throw the exception so the mud will get terminated with error
      // message.
      // (Create a new Error object, because the one we have cought here
      // doesn't contain stack trace.)
      throw new Error;
    }

    return data;
  }

  public static existsSync(filePath: string)
  {
    return fs.existsSync(filePath);
  }

  public static async ensureDirectoryExists(directory: string)
  {
    await promisifiedFS.ensureDir(directory);
  }

  // Directory is empty if it doesn't exist or there no files in it.
  // File is empty if it doesn't exist or it has zero size.
  // (Note: this method can't be async at the moment because async
  //  functions cannot return value (because they return promise)).
  public static isEmpty(path: string): boolean
  {
    return extfs.isEmptySync(path);
  }
}