/*
  Part of BrutusNEXT

  Extends NameLock with 'passwordHash' property so users
  can be authenticated against respektive name lock file.
  This saves us the need to load whole account file whenever
  user tries to log in.
*/


'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {NameLock} from '../../../server/lib/entity/NameLock';
// import {Utils} from '../../../shared/lib/utils/Utils';
// import {JsonObject} from '../../../shared/lib/json/JsonObject';
// import {Entity} from '../../../shared/lib/entity/Entity';
// import {FileSystem} from '../../../server/lib/fs/FileSystem';
// import {ServerApp} from '../../../server/lib/app/ServerApp';

export class AccountNameLock extends NameLock
{
  ///public static get PASSWORD_HASH_PROPERTY() { return 'passwordHash'; }

  // ----------------- Public data ----------------------

  passwordHash: string | null = null;

  // ------------- Public static methods ----------------

  // -> Returns 'undefined' if name lock file doesn't exist.
  // -> Returns 'null' on error.
  public static async load
  (
    name: string,
    cathegoryName: string,
    reportNotFoundError: boolean = true
  )
  : Promise<AccountNameLock.LoadResult>
  {
    TODO

    let accountNameLock = new AccountNameLock();

    if (!(1))
      return "ERROR";

    if (!(2))
      return "FILE_DOES_NOT_EXIST";


    /// Mělo by to vrátit instanci classy AccountNameLock naloadovanou
    /// ze souboru.
    return accountNameLock;
  }

  // ------------- Private static methods ---------------

}

export module AccountNameLock
{
  /// To be deleted
  /*
  export interface LoadOk
  {
    outcome: NameLock.OpenFileOutcome.SUCCESS;
    nameLock: AccountNameLock;
  }

  export type LoadResult =
    AccountNameLock.LoadOk | NameLock.FileDoesNotExist | NameLock.RuntimeError
  */

  export type LoadResult = AccountNameLock | "ERROR" | "FILE_DOES_NOT_EXIST";
}