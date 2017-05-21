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

export class Accounts extends NameList<Account>
{
  constructor()
  {
    super(Entity.NameCathegory.ACCOUNT);
  }

  //------------------ Private data ---------------------

  // Account names that are temporarily marked as taken.
  private nameLocks = new Set<string>();

  // ------------- Public static methods ---------------- 

  // -> Returns 'true' on success.
  public static add(account: Account)
  {
    return ServerApp.getAccounts().add(account);
  }

  // -> Returns 'undefined' if entity 'name' isn't in the list.
  public static get(name: string)
  {
    return ServerApp.getAccounts().get(name);
  }

  // Removes account from Accounts, but not from memory.
  // -> Returns 'true' on success.
  public static remove(account: Account)
  {
    return ServerApp.getAccounts().remove(account);
  }

  // Sets account name as taken in the memory but doesn't create name lock
  // file. This is used when user entered a new account name but hasn't
  // provided a password yet, so account hasn't yet been created.
  public static setSoftNameLock(name: string)
  {
    ServerApp.getAccounts().setSoftNameLock(name);
  }

  // Removes a 'soft' lock on acount name.
  public static removeSoftNameLock(name: string)
  {
    ServerApp.getAccounts().removeSoftNameLock(name);
  }

  public static async isTaken(name: string)
  {
    return await ServerApp.getAccounts().isTaken(name)
  }

  // ---------------- Public methods --------------------

  public async isTaken(name: string)
  {
    // First check if account is already online so we can save ourselves
    // reading from disk.
    if (this.has(name))
      return true;

    // Also check for 'soft' name locks. This is used to prevent two
    // users to simultaneously create an account with the same name.
    if (this.nameLocks.has(name))
      return true;

    return await ServerEntities.isNameTaken
    (
      name,
      Entity.NameCathegory.ACCOUNT
    );
  }

  public setSoftNameLock(name: string)
  {
    this.nameLocks.add(name);
  }

  public removeSoftNameLock(name: string)
  {
    this.nameLocks.delete(name);
  }

  // -------------- Protected methods -------------------

  // ---------------- Private methods -------------------
}