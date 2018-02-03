/*
  Part of BrutusNEXT

  Provides static methods for saving entities on the server.
*/


'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {JsonObject} from '../../../shared/lib/json/JsonObject';
import {Entity} from '../../../shared/lib/entity/Entity';
import {FileSystem} from '../../../server/lib/fs/FileSystem';
import {ServerApp} from '../../../server/lib/app/ServerApp';

export class NameLock
{
  public static get PASSWORD_HASH_PROPERTY() { return 'passwordHash'; }

  // ------------- Public static methods ----------------

  public static async exists
  (
    name: string,
    cathegoryName: string
  )
  {
    // Name lock file path is something like
    // './data/names/accounts/Rahman.json'.
    // It's existence means that account name
    // 'Rahman' is already used.
    let path = this.composePath(name, cathegoryName);

    return await FileSystem.exists(path);
  }

  // -> Returns 'true' on success.
  public static async save
  (
    id: string,
    name: string,
    cathegoryName: string,
    passwordHash: (string | null) = null
  )
  {
    let fileContents = { id: id };

    if (passwordHash !== null)
      fileContents[NameLock.PASSWORD_HASH_PROPERTY] = passwordHash;

    let jsonString = JsonObject.stringify(fileContents);

    // Name lock directory is something like './data/names/accounts/'.
    let directory = this.getDirectory(cathegoryName);

    // Directory might not yet exist, so we better make sure it does.
    if (await FileSystem.ensureDirectoryExists(directory) === false)
      return false;

    // Name lock file name is something like 'Rahman.json'.
    let fileName = this.getFileName(name);
    
    return await FileSystem.writeFile(directory, fileName, jsonString);
  }

  // -> Returns 'undefined' if name lock file doesn't exist.
  // -> Returns 'null' on error.
  public static async load
  (
    name: string,
    cathegoryName: string,
    reportNotFoundError: boolean = true
  )
  {
    let path = this.composePath(name, cathegoryName);
    let jsonString = await FileSystem.readFile
    (
      path,
      {
        binary: false,
        reportErrors: reportNotFoundError
      }
    );

    if (jsonString === null)
      return undefined;

    let jsonObject = JsonObject.parse(jsonString, path);

    if (!jsonObject)
      return null;

    return jsonObject;
  }

  // -> Returns 'undefined' if name lock file doesn't exist.
  // -> Returns 'null' on error.
  public static async readId
  (
    name: string,
    cathegoryName: string,
    reportNotFoundError: boolean = true
  )
  {
    let jsonObject = await NameLock.load
    (
      name,
      cathegoryName,
      reportNotFoundError
    );

    if (!jsonObject)
      return jsonObject;

    if (!jsonObject[Entity.ID_PROPERTY])
      return null;

    return jsonObject[Entity.ID_PROPERTY];
  }

  public static async delete(name: string, cathegoryName: string)
  {
    await FileSystem.deleteFile
    (
      this.composePath(name, cathegoryName)
    );
  }

  // ------------- Private static methods ---------------

  private static composePath
  (
    name: string,
    directory: string,
  )
  {
    // Path is something like './data/names/accounts/Rahman.json'.
    return this.getDirectory(directory)
      + this.getFileName(name);
  }

  private static getFileName(name: string)
  {
    // Name lock file name is something like 'rahman.json'.
    // (It needs to be encoded so all characters that are
    //  invalid in file name are escaped as well as reserved
    //  file names. File name is also lowercased to prevent
    //  different behaviour on different file systems - Windows
    //  FS is case insensitive while Unix/Linux use case sensitive
    //  paths).
    // Also note that there is a limt of 255 bytes of file name
    // length on most Unix file systems. File name will be truncated
    // if it exceeds it.
    return Utils.encodeAsFileName(name) + '.json';
  }

  private static getDirectory(directory: string)
  {
    // Make sure that 'directory' starts with '/';
    if (directory.substr(0, 1) !== '/')
      directory = '/' + directory;

    // Make sure that 'directory' ends with '/';
    if (directory.length > 1 && directory.substr(-1) !== '/')
      directory = directory + '/';

    return ServerApp.DATA_DIRECTORY + 'names' + directory.toLowerCase();
  }
}