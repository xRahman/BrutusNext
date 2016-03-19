/*
  Part of BrutusNEXT

  Container for user accounts.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Server} from '../server/Server';
import {IdContainer} from '../shared/IdContainer';
import {Id} from '../shared/Id';
import {Account} from '../server/Account';
import {Mudlog} from '../server/Mudlog';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

export class AccountManager extends IdContainer<Account>
{
  // ---------------- Public methods --------------------

  public createNewAccount
  (
    accountName: string,
    password: string,
    playerConnectionId: Id
  ): Id
  {
    ASSERT_FATAL(!this.accountExists(accountName),
      "Attempt to create account '"
      + accountName + "' which already exists");

    let newAccount = new Account(accountName, playerConnectionId);

    // This creates and assigns hash. Actual password is not remembered.
    newAccount.setPasswordHash(password);

    let newAccountId = this.addNewAccount(newAccount);

    // Save the account info to the disk (so we know that the account exists).
    // (This does not need to be synchronous.)
    newAccount.save();

    return newAccountId;
  }
  
  public getAccount(id: Id)
  {
    return this.getItem(id);
  }

  // Returns true if account with given name exists.
  public accountExists(accountName: string)
  {
    // First check if account is already online so we can save ourselves
    // reading from disk.
    if (this.myAccountNames[accountName])
      return true;

    let path = Account.SAVE_DIRECTORY + accountName + ".json";

    return fs.existsSync(path);
  }

  // Return account id if account is already loaded, null otherwise.
  public getAccountByName(accountName: string): Account
  {
    // Using 'in' operator on object with null value would crash the game.
    if (!ASSERT(this.myAccountNames !== null,
      "Invalid myOnlineAccountNames"))
      return null;

    if (accountName in this.myAccountNames)
    {
      // Attempt to re-log to an online account.
      let accountId = this.myAccountNames[accountName];

      return this.getItem(accountId);
    }

    return null;
  }

  public registerLoadedAccount(account: Account)
  {
    ASSERT_FATAL(!this.getAccountByName(account.accountName),
      "Attempt to register account '"
      + account.accountName + "' which is already registered");

    this.addAccount(account);
  }

  public logOut(accountId: Id)
  {
    let account = this.getAccount(accountId);
    let accountName = account.accountName;
    let ipAddress = account.playerConnection.ipAddress;

    if (!ASSERT(!this.getAccount(accountId).isInGame(),
          "Attempt to logout a player who is still in game"))
      return;

    Mudlog.log(
      accountName + " [" + ipAddress  + "] has logged out",
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL);

    this.dropAccount(accountId);
  }

  // -------------- Protected class data ----------------

  // This hashmap maps account names to account ids.
  protected myAccountNames: { [key: string]: Id } = {};

  // -------------- Protected methods -------------------

  // Adds an account to the list of online accounts and to the auxiliary
  // hashmap, returns its unique id.
  protected addNewAccount(account: Account): Id
  {
    let newId = this.addNewItem(account);

    // Also add record to the corresponding hashmap.
    this.myAccountNames[account.accountName] = newId;

    return newId;
  }

  // Adds an account which already has an id (loaded from file).
  protected addAccount(account: Account)
  {
    this.addItem(account);

    // Also add record to the corresponding hashmap.
    this.myAccountNames[account.accountName] = account.id;
  }

  // Removes an account both from the list of online accounts and from the
  // auxiliary hasmap.
  protected dropAccount(accountId: Id)
  {
    let accountName = this.getAccount(accountId).accountName;

    this.deleteItem(accountId);

    // Also remove record from the corresponding hashmap.
    delete this.myAccountNames[accountName];
  }
}