/*
  Part of BrutusNEXT

  Implements player account.
*/

import {SaveableContainer} from '../shared/SaveableContainer';
import {AccountData} from '../server/AccountData';

// Built-in node.js modules.
import * as crypto from 'crypto';  // Import namespace 'crypto' from node.js

export class Account extends SaveableContainer
{
  // Account name is not saved to the file. Filename represents account name.
  constructor(protected myAccountName: string)
  {
    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    super({ version: 0 });
  }

  static get SAVE_DIRECTORY() { return "./data/accounts/"; }

  // ---------------- Public methods --------------------

  public save()
  {
    this.saveToFile(Account.SAVE_DIRECTORY + this.myAccountName + ".json");
  }

  public load()
  {
    this.loadFromFile(Account.SAVE_DIRECTORY + this.myAccountName + ".json");
  }

  // Only hash of the password is stored
  public set password(value: string)
  {
    let hash = crypto.createHash('md5');
    hash.update(value.trim());
    this.myData.password = hash.digest('hex');
  }

  public processCommand(command: string)
  {
    /// TODO
  }

  public checkPassword(password: string): boolean
  {
    let hash = crypto.createHash('md5');
    hash.update(password.trim());

    return this.myData.password === hash.digest('hex');
  }

  // -------------- Protected class data ----------------

  public myData = new AccountData();

  // --------------- Protected methods ------------------
}