/*
  Part of BrutusNEXT

  Saveable data members for Account class.
*/

'use strict';

import {SaveableObject} from '../shared/SaveableObject';

export class AccountData extends SaveableObject
{
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // Names of characters belonging to this account.
  public characters: Array<string> = [];

  // dateofCreation always initializes to current time, but for existing
  // accounts will be overwritten when loading from file. 
  public dateOfCreation = new Date();

  // Not really a password, just it's hash.
  public password = "";

  public accountName = "";
}