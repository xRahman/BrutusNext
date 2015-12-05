/*
  Part of BrutusNEXT

  Implements container for user accounts.
*/

import {ASSERT_FATAL} from '../shared/ASSERT';
import {IdProvider} from '../shared/IdProvider';
import {Account} from '../server/Account';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

const ACCOUNTS_DIRECTORY = "./data/accounts/";

export class AccountManager extends IdProvider
{
  // ---------------- Public methods --------------------

  // Adds an account to the list of online accounts,
  // returns its unique string id.
  public addNewAccount(accountName: string): string
  {
    // generateId() is a method inherited from IdProvider.
    let newId = this.generateId();

    ASSERT_FATAL(!(newId in this.myOnlineAccounts),
      "Account '" + newId + "' already exists");

    // Here we are creating a new property in myOnlineAccounts
    // (it is possible because myOnlineAccounts is a hashmap)
    this.myOnlineAccounts[newId] = new Account(accountName);
    // Also add record to the coresponding hashmap.
    this.myOnlineAccountNames[accountName] = newId;

    return newId;
  }

  public getAccount(id: string)
  {
    let account = this.myOnlineAccounts[id];
    ASSERT_FATAL(typeof account !== 'undefined',
      "Account (" + id + ") doesn't exist");

    return account;
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

  public logIn(accountName: string, password: string)
  {
    /// TODO

    // login failed.
    return false;
  }

  // -------------- Protected class data ----------------

  // This hashmap allows to access accounts using unique string ids.
  // (it only stores accounts of players currently online, not all existing
  // accounts)
  protected myOnlineAccounts: { [key: string]: Account } = {};
  // This hashmap maps account names to account keys.
  protected myOnlineAccountNames: { [key: string]: string } = {};

  // -------------- Protected methods -------------------
}