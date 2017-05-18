/*
  Part of BrutusNEXT

  Provides static methods for saving entities on the server.
*/


'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {JsonObject} from '../../../shared/lib/json/JsonObject';
///import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {FileSystem} from '../../../server/lib/fs/FileSystem';
import {ServerApp} from '../../../server/lib/app/ServerApp';

export class NameLock
{
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
    let path = this.getPath(name, cathegoryName);

    return await FileSystem.exists(path);
  }

  // -> Returns 'true' on success.
  public static async save
  (
    id: string,
    name: string,
    cathegoryName: string
  )
  {
    // Name lock file will contain serialized object with a single
    // 'id' property.
    let jsonString = JsonObject.stringify({ id: id });

    // Name lock directory is something like './data/names/accounts/'.
    let directory = this.getDirectory(cathegoryName);

    // Directory might not yet exist, so we better make sure it does.
    if (await FileSystem.ensureDirectoryExists(directory) === false)
      return false;

    // Name lock file name is something like 'Rahman.json'.
    let fileName = this.getFileName(name);
    
    return await FileSystem.writeFile(jsonString, directory + fileName);
  }

  // -> Returns 'null' if name lock file doesn't exist or if it doesn't
  //    contain an 'id' property.
  public static async readId
  (
    name: string,
    cathegoryName: string,
    reportErrors: boolean = true
  )
  {
    let path = this.getPath(name, cathegoryName);
    let jsonString = await FileSystem.readFile
    (
      path,
      {
        binary: false,
        reportErrors: reportErrors
      }
    );

    if (jsonString === null)
      return null;

    let jsonObject = JsonObject.parse(jsonString, path);

    if (!jsonObject[Entity.ID_PROPERTY])
      return null;

    return jsonObject[Entity.ID_PROPERTY];
  }

  public static async delete(name: string, cathegoryName: string)
  {
    await FileSystem.deleteFile
    (
      this.getPath(name, cathegoryName)
    );
  }

  // ------------- Private static methods ---------------

  private static getPath
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
    // (It is lovercased to prevent different behaviour on
    //  different file systems - Windows FS is case insensitive
    //  while Unix/Linux use case sensitive paths).
    return name.toLowerCase() + '.json';
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