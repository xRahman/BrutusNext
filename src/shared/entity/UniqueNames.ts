/*
  Part of BrutusNEXT

  Auxiliary class that checks uniqueness of entity names.
*/

'use strict';

export class UniqueNames
{
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module UniqueNames
{
  // Names of unique-named entities are unique only within each cathegory,
  // so you can have for example account Rahman and character Rahman.
  // These cathegories also serve as names of directories in /data with
  // files translating unique names to entity ids. So there will be
  // file /data/accounts/Rahman.json and /data/characters/Rahman.json.
  // (this is the reason why cathegories are lower case - so we don't have
  // uppercase names of directories in /data)
  export enum Cathegory
  {
    accounts,
    characters,
    worlds,
  }
}