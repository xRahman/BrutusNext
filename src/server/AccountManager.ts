/*
  Part of BrutusNEXT

  Container for user accounts.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
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

    let newAccountId = this.addOnlineAccount(newAccount);

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
    if (this.myOnlineAccountNames[accountName])
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

    if (accountName in this.myOnlineAccountNames)
    {
      // Attempt to re-log to an online account.
      accountId = this.myOnlineAccountNames[accountName];
      account = this.getAccount(accountId);
    } else
    {
      // Login to an offline account.
      account = new Account(accountName, playerConnectionId);
      accountId = this.addOnlineAccount(account);
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
    let accountName = this.getAccount(accountId).accountName;

    if (!ASSERT(!this.getAccount(accountId).isInGame(),
          "Attempt to logout a player who is still in game"))
      return;

    Mudlog.log(
      "Player " + accountName + " has logged out",
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL);

    this.removeOnlineAccount(accountId);
  }

  // -------------- Protected class data ----------------

  // This hashmap maps account names to account ids.
  protected myOnlineAccountNames: { [key: string]: Id } = {};

  // -------------- Protected methods -------------------

  // Adds an account to the list of online accounts and to the auxiliary
  // hashmap, returns its unique id.
  protected addOnlineAccount(account: Account): Id
  {
    let newId = this.addItem(account);

    // Also add record to the corresponding hashmap.
    this.myOnlineAccountNames[account.accountName] = newId;

    return newId;
  }

  // Removes an account both from the list of online accounts and from the
  // auxiliary hasmap
  protected removeOnlineAccount(accountId: Id)
  {
    let accountName = this.getAccount(accountId).accountName;

    super.deleteItem(accountId);

    // Also remove record from the corresponding hashmap.
    delete this.myOnlineAccountNames[accountName];
  }
}