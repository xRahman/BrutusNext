/*
  Part of BrutusNEXT

  Container for user accounts.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {FileSystem} from '../shared/fs/FileSystem';
import {Server} from '../server/Server';
import {NameSearchList} from '../shared/NameSearchList';
///import {EntityId} from '../shared/EntityId';
import {EntityManager} from '../shared/EntityManager';
import {Account} from '../server/Account';
import {Mudlog} from '../server/Mudlog';
import {Connection} from '../server/Connection';

export class AccountList extends NameSearchList
{
  // -------------- Private class data -----------------

  // ---------------- Public methods --------------------

  public createAccount
  (
    accountName: string,
    password: string,
    connection: Connection
  )
  : Account
  {
    ASSERT_FATAL(!this.exists(accountName),
      "Attempt to create account '"
      + accountName + "' which already exists");

    let account = EntityManager.createNamedEntity
    (
      accountName,
      'Account',
      Account
    );

    // This creates and assigns hash. Actual password is not remembered.
    account.setPasswordHash(password);

    ///let id = Server.idProvider.createId(account);

    this.add(account);

    /*
    // Set newAccount.adminLevel to 5 if there are no other accounts on the
    // disk (this needs to be done before newAcount is saved of course).
    newAccount.firstAccountCheck();
    */

    /*
    console.log(account['_internalEntity'].name);
    account.isValid();
    */

    // Save the account info to the disk (so we know that the account exists).
    // (We don't need to wait for account to finish saving here, so no need
    // for await.)
    account.save();

    return account;
  }

  // Returns true if account with given name exists.
  public exists(accountName: string)
  {
    // First check if account is already online so we can save ourselves
    // reading from disk.
    if (this.hasUniqueEntity(accountName))
      return true;

    let path = Account.SAVE_DIRECTORY + accountName + ".json";

    return FileSystem.existsSync(path);
  }

  // -> Returns undefined if account isn't onlne or doesn't exist.
  public getAccountByName(accountName: string)
  {
    // Attempt to re-log to an online account.
    return this.getEntityByName(accountName);
  }

  public dropAccount(account: Account)
  {
    // Remove id from thist.
    this.remove(account);

    // Remove entity reference EntityManager so the memory can be dealocated.
    Server.entityManager.remove(account);
  }

  // -------------- Protected methods -------------------
}