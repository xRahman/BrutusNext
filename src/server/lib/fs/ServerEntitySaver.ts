/*
  Part of BrutusNEXT

  Provides static methods for saving entities on the server.
*/


'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {FileSystem} from '../../../server/lib/fs/FileSystem';
import {SavingManager} from '../../../server/lib/fs/SavingManager';

export class ServerEntitySaver
{
  // ------------- Public static methods ----------------

  // -> Returns 'true' on success.
  public static async saveEntity(entity: Entity)
  {
    let fileName = entity.getSaveFileName();
    let directory = entity.getSaveDirectory();

    if (!this.isFileNameValid(entity, directory))
      return false;
    
    if (!this.isDirectoryValid(entity, directory))
      return false;

    directory = this.enforceTrailingSlash(directory);

    let jsonString = entity.serialize(Serializable.Mode.SAVE_TO_FILE);

    // Directory might not yet exist, so we better make sure it does.
    if (await FileSystem.ensureDirectoryExists(directory) === false)
      return false;
    
    await this.saveToFile(jsonString, directory + fileName);
  }

  // -> Returns 'true' on success.
  public static async loadEntity(id: string)
  {
    let fileName = entity.getSaveFileName();
    let directory = entity.getSaveDirectory();

    if (!this.isFileNameValid(entity, directory))
      return false;
    
    if (!this.isDirectoryValid(entity, directory))
      return false;

    directory = this.enforceTrailingSlash(directory);

    let path = directory + fileName;
    let jsonString = await FileSystem.readFile(path);

    // Create a new entity instance and deserialize Json 'data' into it.
    return Entity.deserialize(jsonString, id, path);
  }

  // ------------ Protected static methods --------------

  // ------------- Private static methods ---------------

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

  private static async loadEntityFromFile
  (
    entity: Entity,
    directory: string,
    fileName: string
  )
  {
    directory = this.enforceTrailingSlash(directory);

    TODO
  }
}