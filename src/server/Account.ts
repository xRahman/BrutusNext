/*
  Part of BrutusNEXT

  Implements player account.
*/

import {SaveableContainer} from '../shared/SaveableContainer';
import {AccountData} from '../server/AccountData';

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
  // ---------------- Public methods --------------------

  public processCommand(command: string)
  {
    /// TODO
  }

  // -------------- Protected class data ----------------

  public myData = new AccountData();

  // --------------- Protected methods ------------------
}