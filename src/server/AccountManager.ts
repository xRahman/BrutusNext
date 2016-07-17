/*
  Part of BrutusNEXT

  Container for user accounts.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {FileSystem} from '../shared/fs/FileSystem';
import {Server} from '../server/Server';
import {IdableObjectContainer} from '../shared/IdableObjectContainer';
import {Id} from '../shared/Id';
import {Account} from '../server/Account';
import {Mudlog} from '../server/Mudlog';

export class AccountManager extends IdableObjectContainer<Account>
{
  // ---------------- Public methods --------------------

  public createNewAccount
  (
    accountName: string,
    password: string,
    playerConnectionId: Id
  )
  : Id
  {
    ASSERT_FATAL(!this.accountExists(accountName),
      "Attempt to create account '"
      + accountName + "' which already exists");

    let newAccount = new Account(accountName, playerConnectionId);

    // This creates and assigns hash. Actual password is not remembered.
    newAccount.setPasswordHash(password);

    let newAccountId = this.addAccountUnderNewId(newAccount);


    // Set newAccount.adminLevel to 5 if there are no other accounts on the
    // disk (this needs to be done before newAcount is saved of course).
    newAccount.firstAccountCheck();

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
    if (this.accountNames[accountName])
      return true;

    let path = Account.SAVE_DIRECTORY + accountName + ".json";

    return FileSystem.existsSync(path);
  }

  // Return account id if account is already loaded, null otherwise.
  public getAccountByName(accountName: string): Account
  {
    // Using 'in' operator on object with null value would crash the game.
    if (!ASSERT(this.accountNames !== null,
      "Invalid accountNames"))
      return null;

    if (accountName in this.accountNames)
    {
      // Attempt to re-log to an online account.
      let accountId = this.accountNames[accountName];

      return this.getItem(accountId);
    }

    return null;
  }

  public registerLoadedAccount(account: Account)
  {
    ASSERT_FATAL(!this.getAccountByName(account.name),
      "Attempt to register account '"
      + account.name + "' which is already registered");

    this.addAccountUnderExistingId(account);
  }

  // Removes an account both from the list of online accounts and from the
  // auxiliary hasmap.
  public dropAccount(accountId: Id)
  {
    let accountName = this.getAccount(accountId).name;

    this.removeItem(accountId);

    // Also remove record from the corresponding hashmap.
    delete this.accountNames[accountName];
  }

  // -------------- Protected class data ----------------

  // This hashmap maps account names to account ids.
  protected accountNames: { [key: string]: Id } = {};

  // -------------- Protected methods -------------------

  // Adds an account to the list of online accounts and to the auxiliary
  // hashmap, returns its unique id.
  protected addAccountUnderNewId(account: Account): Id
  {
    let newId = this.addItemUnderNewId(account);

    // Also add record to the corresponding hashmap.
    this.accountNames[account.name] = newId;

    return newId;
  }

  // Adds an account which already has an id (loaded from file).
  protected addAccountUnderExistingId(account: Account)
  {
    this.addItemUnderExistingId(account);

    // Also add record to the corresponding hashmap.
    this.accountNames[account.name] = account.getId();
  }
}