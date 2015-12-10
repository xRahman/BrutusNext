/*
  Part of BrutusNEXT

  Implements container for user accounts.
*/

import {ASSERT_FATAL} from '../shared/ASSERT';
import {IdContainer} from '../shared/IdContainer';
import {Account} from '../server/Account';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

export class AccountManager extends IdContainer<Account>
{
  // ---------------- Public methods --------------------

  public createNewAccount(accountName: string, password: string): string
  {
    let newAccount = new Account(accountName);

    // This creates and assigns hash, not actual password.
    newAccount.password = password;

    // Save the account info to the disk (so we know that the account exists).
    newAccount.save();

    let newAccountId = this.addOnlineAccount(accountName);

    return newAccountId;
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

    let path = Account.SAVE_DIRECTORY + accountName + ".json";

    return fs.existsSync(path);
  }

  // Returns account id on succes, "" on failure
  public logIn(accountName: string, password: string): string
  {
    let accountId = "";
    let account = null;

    if (accountName in this.myOnlineAccountNames)
    {
      // Attempt to re-log to an online account.
      accountId = this.myOnlineAccountNames[accountName];
      account = this.getAccount(accountId);
    } else
    {
      // Login to an offline account.
      accountId = this.addOnlineAccount(accountName);
      account = this.getAccount(accountId);
      // Load account from file, mainly for us to be able to check if password
      // is correct.
      account.load();
    }

    if (account.checkPassword(password))
      /// TODO: Handle usurping of an existing connection (close old socket,
      /// send info to a new socket, atc.
      return accountId;
    else
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