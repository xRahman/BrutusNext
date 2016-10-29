/*
  Part of BrutusNEXT

  Container for user accounts.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {FileSystem} from '../../shared/fs/FileSystem';
import {Server} from '../../server/Server';
//import {UniqueNames} from '../../shared/entity/UniqueNames';
import {NamedEntity} from '../../shared/entity/NamedEntity';
import {NameSearchList} from '../../shared/entity/NameSearchList';
import {Entity} from '../../shared/entity/Entity';
import {EntityManager} from '../../shared/entity/EntityManager';
import {Account} from '../../server/account/Account';
import {Connection} from '../../server/connection/Connection';

export class AccountList extends NameSearchList
{
  //------------------ Private data ---------------------

  // ---------------- Public methods --------------------

  // -> Returns account 'accountName' loaded from disk.
  //    Returns null if account 'accountName' doesn't exist.
  public async loadAccount(accountName: string, connection: Connection)
  {
    // First check if account is already loaded. 
    let account = this.getAccountByName(accountName);

    // If it is already loaded, there is no point in loading it again.
    if (account !== undefined)
    {
      ERROR("Attempt to create account '" + accountName + "'"
        + " which already exists. Account is not created");
      return account;
    }

    // Second parameter of loadNamedEntity is used for dynamic type cast.
    account = await EntityManager.loadNamedEntity
    (
      accountName,
      NamedEntity.UniqueNameCathegory.accounts,
      Account
    );

    if (!Entity.isValid(account))
    {
      ERROR("Failed to load account " + account.name);
      return null;
    }

    account.connection = connection;

    if (accountName !== account.name)
    {
      ERROR("Account name saved in file (" + account.name + ")"
        + " doesn't match account file name (" + accountName + ")."
        + " Renaming account to match file name");
    
      account.name = accountName;
    }

    this.add(account);

    return account;
  }

  public async createAccount
  (
    accountName: string,
    password: string,
    connection: Connection
  )
  : Promise<Account>
  {
    if (await this.exists(accountName))
    {
      ERROR("Attempt to create account '" + accountName + "'"
        + " which already exists. Account is not created");
      return null;
    }

    let account = await EntityManager.createNamedEntity
    (
      // Name of the entity to create.
      accountName,
      // Cathegory in which the name must be unique.
      NamedEntity.UniqueNameCathegory.accounts,
      // Name of the prototype class.
      'Account',
      // Dynamic type cast.
      Account
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

  // Returns true if account with given name exists.
  public async exists(accountName: string)
  {
    // First check if account is already online so we can save ourselves
    // reading from disk.
    if (this.hasUniqueEntity(accountName))
      return true;

    return await NamedEntity.isNameTaken
    (
      accountName,
      NamedEntity.UniqueNameCathegory.accounts
    );
  }

  // -> Returns undefined if account isn't online or doesn't exist.
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