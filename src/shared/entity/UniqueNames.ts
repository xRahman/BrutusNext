/*
  Part of BrutusNEXT

  Auxiliary class that checks uniqueness of entity names.
*/

'use strict';

import {FileSystem} from '../../shared/fs/FileSystem';

export class UniqueNames
{
  public static getFilePath(name: string, cathegory: UniqueNames.Cathegory)
  {
    // Path is something like '/data/names/accounts/Rahman.json'.
    return '/data/names/' + UniqueNames.Cathegory[cathegory]
      + '/' + name + '/json';
  }

  public static async exists(name: string, cathegory: UniqueNames.Cathegory)
  {
    let filePath = UniqueNames.getFilePath(name, cathegory);

    return await FileSystem.exists(filePath);
  }

  public static async deleteNameLockFile
  (
    name: string,
    cathegory: UniqueNames.Cathegory
  )
  {
    let filePath = UniqueNames.getFilePath(name, cathegory);

    await FileSystem.
  }
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module UniqueNames
{
  // Names of unique-named entities are unique only within each
  // cathegory, so you can have for example account Rahman and
  // character Rahman. These cathegories also serve as names of
  // directories in /data with files translating unique Names to
  // entity ids. So there will be file /data/names/accounts/Rahman.json
  // and  /data/names/characters/Rahman.json.
  // (this is the reason why cathegories are lower case - so we don't
  // have uppercase names of directories in /data)
  export enum Cathegory
  {
    accounts,
    characters,
    // Various world locations.
    // (Rooms, Realms, Areas, the name of the world itself, etc.)
    world
  }
}