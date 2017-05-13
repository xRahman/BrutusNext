/*
  Part of BrutusNEXT

  Provides static methods for saving entities on the server.
*/


'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {JsonObject} from '../../../shared/lib/json/JsonObject';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {FileSystem} from '../../../server/lib/fs/FileSystem';
import {SavingManager} from '../../../server/lib/fs/SavingManager';

export class FileManager
{
  public static get DATA_DIRECTORY()
  {
    ///return './data/';
    return './server/data/';
  }

  // ------------- Public static methods ----------------

  public static async doesDataDirectoryExist()
  {
    return await FileSystem.exists(this.DATA_DIRECTORY)
  }

  public static async doesNameLockFileExist
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    // Name lock file path is something like
    // './data/names/accounts/Rahman.json'.
    // It's existence means that account name
    // 'Rahman' is already used.
    let path = this.getNameLockFilePath(name, cathegory);

    return await FileSystem.exists(path);
  }

  // -> Returns 'true' on success.
  public static async saveNameLockFile
  (
    id: string,
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    // Name lock file will contain serialized object with a single
    // 'id' property.
    let jsonString = JsonObject.stringify({ id: id });

    // Name lock directory is something like './data/names/accounts/'.
    let directory = FileManager.getNameLockDirectory(cathegory);

    // Directory might not yet exist, so we better make sure it does.
    if (await FileSystem.ensureDirectoryExists(directory) === false)
      return false;

    // Name lock file name is something like 'Rahman.json'.
    let fileName = FileManager.getNameLockFileName(name);
    
    return await this.saveToFile(jsonString, directory + fileName);
  }

  // -> Returns 'null' if name lock file doesn't exist or if it doesn't
  //    contain an 'id' property.
  public static async readIdFromNameLockFile
  (
    name: string,
    cathegory: Entity.NameCathegory,
    reportErrors: boolean = true
  )
  {
    let path = this.getNameLockFilePath(name, cathegory);
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

  public static async deleteNameLockFile
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    await FileSystem.deleteFile(this.getNameLockFilePath(name, cathegory));
  }

  // -> Returns 'true' on success.
  public static async saveEntity(entity: Entity)
  {
    // Note: Name lock file is saved when the name is set
    // to the entity so we don't have to save it here.

    let fileName = this.getEntityFileName(entity.getId());
    let directory = this.getEntityDirectory();

    directory = this.enforceTrailingSlash(directory);

    let jsonString = entity.serialize(Serializable.Mode.SAVE_TO_FILE);

    // Directory might not yet exist, so we better make sure it does.
    if (await FileSystem.ensureDirectoryExists(directory) === false)
      return false;

    await this.saveToFile(jsonString, directory + fileName);
  }

  // -> Returns 'true' on success.
  public static async loadEntityById(id: string)
  {
    let fileName = this.getEntityFileName(id);
    let directory = this.getEntityDirectory();

    directory = this.enforceTrailingSlash(directory);

    let path = directory + fileName;
    let jsonString = await FileSystem.readFile(path);

    // Create a new entity instance and deserialize JSON 'data' into it.
    return Serializable.deserialize(jsonString, id, path);
  }
  
  // -> Returns 'null' on failure.
  public static async loadEntityByName
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    let id = await this.readIdFromNameLockFile(name, cathegory);

    if (!id)
      return null;

    return await this.loadEntityById(id);
  }

  // ------------ Protected static methods --------------

  // ------------- Private static methods ---------------

  private static getEntityFileName(id: string)
  {
    return id + '.json';
  }

  private static getEntityDirectory()
  {
    return this.DATA_DIRECTORY + 'entities/';
  }

  private static getNameLockFilePath
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    // Path is something like './data/names/accounts/Rahman.json'.
    return this.getNameLockDirectory(cathegory)
      + this.getNameLockFileName(name);
  }

  private static getNameLockFileName(name: string)
  {
    // Name lock file name is something like 'rahman.json'.
    // (It is lovercased to prevent different behaviour on
    //  different file systems - Windows FS is case insensitive
    //  while Unix/Linux use case sensitive paths).
    return name.toLowerCase() + '.json';
  }

  private static getNameLockDirectory(cathegory: Entity.NameCathegory)
  {
    // Name lock directory is something like './data/names/accounts/'
    return this.DATA_DIRECTORY + 'names/'
      + Entity.NameCathegory[cathegory].toLowerCase() + '/';
  }

  // This is just a generic async function that will finish
  // when 'promise' parameter gets resolved.
  // (This only makes sense if you also store 'resolve' callback
  //  of the promise so you can call it to finish this awaiter.
  //  See SavingRecord.addRequest() for example how is it done.)
  private static saveAwaiter(promise: Promise<void>)
  {
    return promise;
  }

  // Makes sure that 'directory' string ends with '/'.
  private static enforceTrailingSlash(directory: string): string
  {
    if (directory.substr(directory.length - 1) !== '/')
    {
      ERROR("Directory path '" + directory + "' doesn't end with '/'."
        + "The '/' is added automatically, but it should be fixed anyways");
      return directory + '/';
    }

    return directory;
  }

  /// Tohle teď není potřeba, cesty se vyrábí přímo ve FileManageru
  /// a jsou vždycky stejné: /data/entities/id.json.
  /*
  private static isFileNameValid(entity: Entity, fileName: string)
  {
    if (fileName !== undefined
        && fileName !== null
        && fileName !== "")
      return true;

    ERROR("Invalid 'fileName' when saving "
         + entity.getErrorIdString()  + "."
         + " Entity is not saved");

    return false;
  }
  */
  
  /// Tohle teď není potřeba, cesty se vyrábí přímo ve FileManageru
  /// a jsou vždycky stejné: /data/entities/id.json.
  /*
  private static isDirectoryValid(entity: Entity, directory: string)
  {
    if (directory !== undefined
        && directory !== null
        && directory !== "")
      return true;

    ERROR("Invalid 'directory' when saving "
         + entity.getErrorIdString()  + "."
         + " Entity is not saved");

    return false;
  }
  */

  // -> Returns 'true' on success.
  private static async saveToFile(data: string, path: string)
  {
    // Following code is addresing feature of node.js file saving
    // functions, which says that we must not attempt saving the same
    // file until any previous saving finishes (otherwise it is not
    // guaranteed that file will be saved correctly).
    //   To ensure this, we use SavingManager to register all saving
    // that is being done to each file and buffer saving requests if
    // necessary.
    let promise = SavingManager.requestSaving(path);

    // If SavingManager.requestSaving returned 'null', it
    // means that 'path' is not being saved right now
    // so we can start saving right away.
    //   Otherwise we need to wait (using the promise we have
    // just obtained) for our turn.
    // Note:
    //   saveAwaiter() function will get finished by SavingManager
    // by calling resolve callback of the promise we have just been
    // issued when previous saving finishes. 
    if (promise !== null)
      await this.saveAwaiter(promise);

    // Now it's our turn so we can save ourselves.
    let success = await FileSystem.writeFile(path, data);

    // Remove the lock.
    // (it will also trigger calling of resolve callback
    //  of whoever might be waiting after us)
    SavingManager.finishSaving(path);

    return success;
  }
}