/*
  Part of BrutusNEXT

  Container for user accounts.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {ServerApp} from '../../../server/lib/app/ServerApp';
import {NameList} from '../../../shared/lib/entity/NameList';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {Account} from '../../../server/lib/account/Account';
import {Connection} from '../../../server/lib/net/Connection';
import {RegisterRequest} from '../../../shared/lib/protocol/RegisterRequest';

export class Accounts
{
  //------------------ Private data ---------------------

  // Account names that are temporarily marked as taken.
  private nameLocks = new Set<string>();

  // List of characters with unique names that are loaded in the memory.
  private names = new NameList<Account>(Entity.NameCathegory.ACCOUNT);

  // ------------- Public static methods ----------------

  public static async create
  (
    request: RegisterRequest,
    connection: Connection
  )
  : Promise<Account>
  {
    if (!connection)
    {
      ERROR("Invalid connection");
      return null;
    }

    let account = await ServerEntities.createInstanceEntity
    (
      Account,
      Account.name,
      request.accountName,
      Entity.NameCathegory.ACCOUNT
    );

    if (!Entity.isValid(account))
    {
      ERROR("Failed to create account '" + request.accountName + "'");
      return null;
    }

    account.setPasswordHash(request.password);
    account.connection = connection;
    connection.account = account;

    account.addToLists();

    // // 'ServerEntities.createInstance()' has created
    // // a name lock file, so we can remove soft name lock.
    // Accounts.removeSoftNameLock(this.accountName);

    await ServerEntities.save(account);

    return account;
  }

  // -> Returns 'true' on success.
  public static add(account: Account)
  {
    return ServerApp.accounts.names.add(account);
  }

  // -> Returns 'undefined' if entity 'name' isn't in the list.
  public static get(name: string)
  {
    return ServerApp.accounts.names.get(name);
  }

  // Removes account from Accounts, but not from memory.
  // -> Returns 'true' on success.
  public static remove(account: Account)
  {
    return ServerApp.accounts.names.remove(account);
  }

  // Sets account name as taken in the memory but doesn't create name lock
  // file. This is used when user entered a new account name but hasn't
  // provided a password yet, so account hasn't yet been created.
  public static setSoftNameLock(name: string)
  {
    ServerApp.accounts.nameLocks.add(name);
  }

  // Removes a 'soft' lock on acount name.
  public static removeSoftNameLock(name: string)
  {
    ServerApp.accounts.nameLocks.delete(name);
  }

  public static async isTaken(name: string)
  {
    // First check if account is already online so we can save ourselves
    // reading from disk.
    if (ServerApp.accounts.names.has(name))
      return true;

    // Also check for 'soft' name locks. This is used to prevent two
    // users to simultaneously create an account with the same name.
    if (ServerApp.accounts.nameLocks.has(name))
      return true;

    return await ServerEntities.isEntityNameTaken
    (
      name,
      Entity.NameCathegory.ACCOUNT
    );
  }
}