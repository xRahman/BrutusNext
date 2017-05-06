/*
  Part of BrutusNEXT

  Container for user accounts.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
///import {FileSystem} from '../../../server/lib/fs/FileSystem';
import {ServerApp} from '../../../server/lib/Server';
import {NamedEntity} from '../../../server/lib/entity/NamedEntity';
import {NameSearchList} from '../../../server/lib/entity/NameSearchList';
import {Entity} from '../../../server/lib/entity/Entity';
import {EntityManager} from '../../../server/lib/entity/EntityManager';
import {Account} from '../../../server/lib/account/Account';
import {Connection} from '../../../server/lib/connection/Connection';

export class AccountList extends NameSearchList
{
  //------------------ Private data ---------------------

  // A set of account names that are soft locked (= only in
  // memory, not on disk using a name lock file) as taken.
  private nameLocks = new Set<string>();

  // ---------------- Public methods --------------------

  // -> Returns account loaded from disk.
  //    Returns null if account 'name' doesn't exist or couldn't be loaded.
  public async loadAccount(name: string, connection: Connection)
  {
    let account = await super.loadNamedEntity
    (
      name,
      NamedEntity.NameCathegory.accounts
    );

    if (account !== null)
      account.connection = connection;

    return account;

    /*
    // First check if account is already loaded. 
    let account = this.getAccountByName(name);

    // If it is already loaded, there is no point in loading it again.
    if (account !== undefined)
    {
      ERROR("Attempt to load account '" + name + "'"
        + " which already exists. Returning existing account");
      return account;
    }

    // Second parameter of loadNamedEntity is used for dynamic type cast.
    account = await EntityManager.loadNamedEntity
    (
      name,
      NamedEntity.NameCathegory.accounts,
      Account
    );

    if (!Entity.isValid(account))
    {
      ERROR("Failed to load account " + name);
      return null;
    }

    account.connection = connection;

    if (name !== account.name)
    {
      ERROR("Account name saved in file (" + account.name + ")"
        + " doesn't match account file name (" + name + ")."
        + " Renaming account to match file name");
    
      account.name = name;
    }

    this.add(account);
    */
  }

  public async createAccount
  (
    accountName: string,
    password: string,
    connection: Connection
  )
  : Promise<Account>
  {
    /// This check would always fail, becuase we are using soft name
    /// locks now. And it is also checked inside a createNamedEntity()
    /// so this check here has been redundant anyways.
    /*
    if (await this.exists(accountName))
    {
      ERROR("Attempt to create account '" + accountName + "'"
        + " which already exists. Account is not created");
      return null;
    }
    */

    let account = await ServerApp.entityManager.createUniqueEntity
    (
      accountName,
      Account,
      NamedEntity.NameCathegory.accounts,
    );

    // Check if account has been created succesfully.
    // (it might not be true for example if unique name was already taken)
    if (account === null)
      return null;

    // This creates and assigns hash. Actual password is not remembered.
    account.setPasswordHash(password);
    account.connection = connection;

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

  // -> Returns 'true' if account with given name exists.
  public async exists(name: string)
  {
    // First check if account is already online so we can save ourselves
    // reading from disk.
    if (this.hasUniqueEntity(name))
      return true;

    // Also check for 'soft' name locks. This is used to prevent two
    // users to simultaneously create an account with the same name.
    if (this.nameLocks.has(name))
      return true;

    return await NamedEntity.isNameTaken
    (
      name,
      NamedEntity.NameCathegory.accounts
    );
  }

  // -> Returns undefined if account isn't online or doesn't exist.
  public getAccountByName(name: string)
  {
    return this.getEntityByName(name);
  }

  public dropAccount(account: Account)
  {
    // Remove id from thist.
    this.remove(account);

    // Remove entity reference EntityManager so the memory can be dealocated.
    ServerApp.entityManager.remove(account);
  }

  // Sets account name as taken in the memory but doesn't create name lock
  // file. This is used when user entered a new account name but hasn't
  // provided a password yet, so account hasn't yet been created.
  public setSoftNameLock(name: string)
  {
    this.nameLocks.add(name);
  }

  // Removes a 'soft' lock on acount name.
  public removeSoftNameLock(name: string)
  {
    this.nameLocks.delete(name);
  }

  // -------------- Protected methods -------------------
}