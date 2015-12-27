/*
  Part of BrutusNEXT

  Saveable data members for Account class.
*/

'use strict';

import {Id} from '../shared/Id';
import {SaveableObject} from '../shared/SaveableObject';
import {SaveableArray} from '../shared/SaveableArray';

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
  /// At the moment this is not used to log in the game, because player always
  /// have only one character with the same name as account. When the character
  /// is created, the name is added to this array, however, so it can be
  /// operated with if multiple characters per account were implemented.
  ///public characters: Array<string> = [];
  public characters: SaveableArray<Id> = new SaveableArray<Id>(Id);

  // dateofCreation always initializes to current time, but for existing
  // accounts will be overwritten when loading from file. 
  public timeOfCreation = new Date();

  // Not really a password, just it's hash.
  public password = "";

  public accountName = "";
}