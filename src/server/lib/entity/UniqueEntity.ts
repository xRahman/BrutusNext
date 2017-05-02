/*
  Part of BrutusNEXT

  Allows entities to be named.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {SharedGameEntity} from '../../../shared/game/entity/SharedGameEntity';
import {NameLockRecord} from '../../../server/lib/entity/NameLockRecord';
import {FileSystem} from '../../../server/lib/fs/FileSystem';
import {ServerApp} from '../../../server/lib/Server';

export class UniqueEntity extends SharedGameEntity
{

  // In what cathegory is this name unique (accounts, characters, world...).
  // Value 'null' means that the name is not unique.
  private uniqueNameCathegory: NamedEntity.NameCathegory = null;

  // --------------- Public accessors -------------------

  public getName()
  {
    if (this.name === null)
    {
      ERROR("Attempt to read the name of an entity before"
        + " it has been inicialized");
      return "Unnamed Entity";
    }

    return this.name;
  }

  // Sets a non-unique name to an entity. Only usable
  // if entity doesn't have unique name!
  // (It's because removing a name lock file for old
  //  unique name is an async operation - if you need
  //  to set a new name to an uniquely named entity,
  //  you need to use 'await setName()' instead of
  //  setNameSync().)
  // -> Returns 'true' if name was successfuly set.
  public setNameSync(name: string)
  {
    if (this.uniqueNameCathegory !== null)
    {
      ERROR("Attempt to synchronously set a name to entity"
        + " " + this.getErrorIdString() +  " which has a"
        + " unique name. You need to use 'await setName()'"
        + " to set a new name to this entity instead of"
        + " setNameSync(). Name is not set");
      return false;
    }

    if (name === null || name === undefined || name === "")
    {
      ERROR("Attempt to set empty name to entity"
        + " " + this.getErrorIdString() + ". Name"
        + " is not set");
      return false;
    }

    this.name = name;

    return true;
  }

  // -> Returns 'true' if name was successfuly set, 'false' otherwise.
  public async setName(name: string, cathegory: NamedEntity.NameCathegory)
  {
    if (cathegory === null)
      return await this.setNonuniqueName(name);

    return await this.setUniqueName(name, cathegory);
  }

  // ---------------- Public methods --------------------

  public static async isNameTaken
  (
    name: string,
    cathegory: NamedEntity.NameCathegory
  )
  {
    // Name lock file path is something like
    // './data/names/accounts/Rahman.json'.
    // It's existence means that account name
    // 'Rahman' is already used.
    let path = NamedEntity.getNameLockFilePath(name, cathegory);

    return await FileSystem.exists(path);
  }

  public static getNameLockFilePath
  (
    name: string,
    cathegory: NamedEntity.NameCathegory
  )
  {
    // Path is something like './data/names/accounts/Rahman.json'.
    return NamedEntity.getNameLockDirectory(cathegory)
      + NamedEntity.getNameLockFileName(name);
  }

  /// TODO: Přesunout do Entity
  public isNameUnique() { return this.uniqueNameCathegory !== null; }

  // Returns something like "Character 'Zuzka' (id: d-imt2xk99)"
  // (indended for use in error messages).
  public getErrorIdString()
  {
    let id = this.getId();

    if (id === null)
    {
      return "{ className: " + this.className + ","
           + " name: " + this.name + ", id: null }";
    }

    return "{ className: " + this.className + ", name: " + this.name + ","
      + " id: " + id + " }";
  }

  // -> Returns 'true' if file is successfuly created, 'false' otherwise.
  public async createNameLockFile
  (
    name: string,
    cathegory: NamedEntity.NameCathegory
  )
  {
    let nameLockRecord = new NameLockRecord();

    // Name lock directory is something like './data/names/accounts/'.
    let directory = NamedEntity.getNameLockDirectory(cathegory);

    // Name lock file name is something like 'Rahman.json'.
    let fileName = NamedEntity.getNameLockFileName(name);

    nameLockRecord.id = this.getId();

    await nameLockRecord.saveToFile(directory, fileName);

    return true;
  }

  // ---------------- Private methods -------------------

  private static getNameLockFileName(name: string)
  {
    // Name lock file name is something like 'Rahman.json'.
    return name + '.json';
  }

  private static getNameLockDirectory(cathegory: NamedEntity.NameCathegory)
  {
    // Name lock directory is something like './data/names/accounts/'.
    return ServerApp.DATA_DIRECTORY + 'names/'
      + NamedEntity.NameCathegory[cathegory] + '/';
  }

  // -> Returns 'true' if file is successfuly deleted, 'false' otherwise. 
  private async deleteNameLockFile()
  {
    let path = NamedEntity.getNameLockFilePath
    (
      this.name,
      this.uniqueNameCathegory
    );

    return await FileSystem.deleteFile(path);
  }

  // The name won't be unique. If this enity had a unique name
  // previously, it will get freed to reuse.
  // (Note: You only need to 'await' this method if you want to
  //        immediately reuse the old unique name - in that case
  //        you have to wait for the name lock file to be deleted.
  //        In all other cases you can call this method as if it
  //        were synchronous.)
  // -> Returns 'true' if name was successfuly set, 'false' otherwise.
  private async setNonuniqueName(newName: string)
  {
    if (newName === null || newName === undefined || newName === "")
    {
      ERROR("Attempt to set empty name to entity"
        + " " + this.getErrorIdString() + ". Name"
        + " is not set");
      return false;
    }

    if (this.name === newName && !this.isNameUnique())
      // No change, so there is nothing to do.
      return false;

    // If the name has been unique before, delete name lock file.
    if (this.isNameUnique())
    {
      if (await this.deleteNameLockFile() === false)
        return false;
    }

    this.name = newName;
    // 'null' value means that 'name' is not unique.
    this.uniqueNameCathegory = null;

    return true;
  }

  // Sets a unique name for this entity. If the previous name
  // has been unique, it will get freed to reuse.
  // -> Returns 'true' if name was successfuly set, 'false' otherwise.
  private async setUniqueName
  (
    newName: string,
    newCathegory: NamedEntity.NameCathegory
  )
  {
    if (newName === null || newName === undefined || newName === "")
    {
      ERROR("Attempt to set invalid name, name is not set");
      return false;
    }

    if (this.name === newName && this.uniqueNameCathegory === newCathegory)
      // No change, so there is nothing to do.
      return true;

    // Check if the new name is available.
    if (await NamedEntity.isNameTaken(newName, newCathegory))
    {
      ERROR("Attempt to change the name of entity "
        + this.getErrorIdString() + " to '" + newName + "',"
        + " which already exists. Name is not changed");
      return false;
    }

    // If name lock file exists for the old name, delete it.
    if (this.isNameUnique())
    {
      if (await this.deleteNameLockFile() === false)
        return false;
    }
    
    if (await this.createNameLockFile(newName, newCathegory) === false)
      // Error is reported by createNameLockFile().
      return false;

    // Now we can do the actual change.
    this.name = newName;
    this.uniqueNameCathegory = newCathegory;

    return true;
  }
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module NamedEntity
{
  // Names of unique-named entities are unique only within each cathegory,
  // so you can have for example account Rahman and character Rahman.
  // These cathegories also serve as names of directories in ./data with
  // files translating unique Names to entity ids. So there will be
  // file './data/names/accounts/Rahman.json'
  // and './data/names/characters/Rahman.json'.
  // (this is the reason why cathegories are lower case - so we don't
  // have uppercase names of directories in ./data)
  export enum NameCathegory
  {
    accounts,
    characters,
    prototypes,
    // Various world locations.
    // (Rooms, Realms, Areas, the name of the world itself, etc.)
    world
  }
}