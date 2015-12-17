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

  public createNewAccount(
    accountName: string,
    password: string,
    playerConnectionId: Id): Id
  {
    ASSERT_FATAL(!this.exists(accountName),
      "Attempt to create an account '"
      + accountName + "' which already exists");

    let newAccount = new Account(accountName, playerConnectionId);

    // This creates and assigns hash. Actual password is not remembered.
    newAccount.password = password;

    let newAccountId = this.addAccount(newAccount);

    // Save the account info to the disk (so we know that the account exists).
    newAccount.save();

    return newAccountId;
  }
  
  public getAccount(id: Id)
  {
    return this.getItem(id);
  }

  // Returns true if account with given name exists.
  public exists(accountName: string)
  {
    // First check if account is already online so we can save reading from
    // disk.
    if (this.myAccountNames[accountName])
      return true;

    let path = Account.SAVE_DIRECTORY + accountName + ".json";

    return fs.existsSync(path);
  }

  // Returns account id on succes, "" on failure
  public logIn(
    accountName: string,
    password: string,
    playerConnectionId: Id): Id
  {
    let accountId: Id = null;
    let account = null;

    // Using 'in' operator on object with null value would crash the game.
    if (!ASSERT(this.myAccountNames !== null,
          "Invalid myOnlineAccountNames"))
      return;

    if (accountName in this.myAccountNames)
    {
      // Attempt to re-log to an online account.
      accountId = this.myAccountNames[accountName];
      account = this.getAccount(accountId);
    } else
    {
      // Login to an offline account.
      account = new Account(accountName, playerConnectionId);
      accountId = this.addAccount(account);
      // Load account from file, mainly for us to be able to check if password
      // is correct.
      account.load();
    }

    if (account.checkPassword(password))
      /// TODO: Handle usurping of an existing connection (close old socket,
      /// send info to a new socket, atc.
      return accountId;
    else
      // We are not going to remove loaded account from the list of online
      // accounts just yet, because user will probably send corrected password
      // so we would have to load account info from the disk again.
      // Account will be put offline when socket is closed.
      return null;
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
  protected addAccount(account: Account): Id
  {
    let newId = this.addItem(account);

    // Also add record to the corresponding hashmap.
    this.myAccountNames[account.accountName] = newId;

    return newId;
  }

  // Removes an account both from the list of online accounts and from the
  // auxiliary hasmap
  protected dropAccount(accountId: Id)
  {
    let accountName = this.getAccount(accountId).accountName;

    super.deleteItem(accountId);

    // Also remove record from the corresponding hashmap.
    delete this.myAccountNames[accountName];
  }
}