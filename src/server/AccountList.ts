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
import {EntityId} from '../shared/EntityId';
import {Account} from '../server/Account';
import {Mudlog} from '../server/Mudlog';

export class AccountList extends NameSearchList
{
  // -------------- Private class data -----------------

  // ---------------- Public methods --------------------

  public createAccount
  (
    accountName: string,
    password: string,
    connectionId: EntityId
  )
  : EntityId
  {
    ASSERT_FATAL(!this.exists(accountName),
      "Attempt to create account '"
      + accountName + "' which already exists");

    let account = new Account(accountName, connectionId);

    // This creates and assigns hash. Actual password is not remembered.
    account.setPasswordHash(password);

    let id = Server.idProvider.createId(account);

    this.add(account);

    /*
    // Set newAccount.adminLevel to 5 if there are no other accounts on the
    // disk (this needs to be done before newAcount is saved of course).
    newAccount.firstAccountCheck();
    */

    // Save the account info to the disk (so we know that the account exists).
    // (We don't need to wait for account to finish saving here, so no need
    // for await.)
    account.save();

    return id;
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

  // Return account id if account is already loaded, null otherwise.
  public getAccountByName(accountName: string): Account
  {
    if (this.hasUniqueEntity(accountName))
    {
      // Attempt to re-log to an online account.
      let id = this.getIdByName(accountName);

      return id.getEntity({ typeCast: Account });
    }

    return null;
  }

  public dropAccount(accountId: EntityId)
  {
    // Remove entity reference from id so the memory can be dealocated.
    accountId.dropEntity();

    // Remove id from idList.
    this.remove(accountId);
  }

  // -------------- Protected methods -------------------
}