/*
  Part of BrutusNEXT

  Implements container for user accounts.
*/

import {ASSERT_FATAL} from '../shared/ASSERT';
import {IdContainer} from '../shared/IdContainer';
import {Account} from '../server/Account';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

const ACCOUNTS_DIRECTORY = "./data/accounts/";

export class AccountManager extends IdContainer<Account>
{
  // ---------------- Public methods --------------------

  public createNewAccount(accountName: string, password: string): string
  {
    let newAccount = new Account(accountName);

    /// TODO



    // Save the account info to the disk (so we know that the account exists).


    return "";
  }
  
  public getAccount(id: string)
  {
    return this.getItem(id);
  }

  // Returns true if account with given name exists.
  public exists(accountName: string)
  {
    // First check if account is already online so we can save reading from
    // disk.
    if (this.myOnlineAccountNames[accountName])
      return true;

    let path = ACCOUNTS_DIRECTORY + accountName + ".json";

    return fs.existsSync(path);
  }

  // Returns account id on succes, "" on failure
  public logIn(accountName: string, password: string): string
  {
    /// TODO

    // login failed.
    return "";
  }

  // -------------- Protected class data ----------------

  // This hashmap maps account names to account keys.
  protected myOnlineAccountNames: { [key: string]: string } = {};

  // -------------- Protected methods -------------------

  // Adds an account to the list of online accounts,
  // returns its unique string id.
  protected addOnlineAccount(accountName: string): string
  {
    let newId = super.addItem(new Account(accountName));

    // Also add record to the coresponding hashmap.
    this.myOnlineAccountNames[accountName] = newId;

    return newId;
  }
}