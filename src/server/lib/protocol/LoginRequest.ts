/*
  Part of BrutusNEXT

  Server-side functionality related to login request packet.
*/

/*
  Note:
    This class needs to use the same name as it's ancestor in /shared,
  because class name of the /shared version of the class is written to
  serialized data on the client and is used to create /server version
  of the class when deserializing the packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {LoginRequest as SharedLoginRequest} from
  '../../../shared/lib/protocol/LoginRequest';
import {ServerUtils} from '../../../server/lib/utils/ServerUtils';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {NameLock} from '../../../server/lib/entity/NameLock';
import {AccountNameLock} from '../../../server/lib/account/AccountNameLock';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {Character} from '../../../server/game/character/Character';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Account} from '../../../server/lib/account/Account';
import {Accounts} from '../../../server/lib/account/Accounts';
import {Connection} from '../../../server/lib/connection/Connection';
import {LoginResponse} from '../../../shared/lib/protocol/LoginResponse';
import {Classes} from '../../../shared/lib/class/Classes';

export class LoginRequest extends SharedLoginRequest
{
  constructor(email: string, password: string)
  {
    super(email, password);

    this.version = 0;
  }

  // ---------------- Public methods --------------------

  // ~ Overrides Packet.process().
  // -> Returns 'true' on success.
  public async process(connection: Connection): Promise<boolean>
  {
    let passwordHash = ServerUtils.md5hash(this.password);

    // If player has already been connected prior to this
    // login request (for example if she logs in from different
    // computer or browser tab while still being logged in from
    // the old location), her Account is still loaded in memory
    // (because it is kept there as long as connection stays open).
    let account = this.findAccountInMemory();

    // In such case, we don't need to load account from disk but
    // we need to close the old connection and socket and also
    // possibly let the player know that her connection has just
    // been usurped.
    if (account)
      return await this.attemptToReconnect(passwordHash, account, connection);

    // If account 'doesn't exist in memory, we need to
    // load it from disk and connect to it.
    //   This also handles situation when user reloads
    // browser tab - browser closes the old connection
    // in such case so at the time user logs back in
    // server has already dealocated old account, connection
    // and socket.
    return await this.attemptToLogin(passwordHash, connection);
  }

  // --------------- Private methods --------------------

  // Note that this should not be used to send anything to
  // user because it may may return an error string that
  // includes account entity id.
  private obtainUserInfo(account: Account): string
  {
    let userInfo = account.getUserInfo();

    if (!userInfo)
      return account.getErrorIdString();

    return userInfo;
  }

  /// To be deleted.
  // private async createOkResponse(account: Account)
  // {
  //   let response = new LoginResponse();
  //   response.result = LoginResponse.Result.OK;

  //   response.setAccount(account);

  //   // Do not load referenced entities (like inventory contents)
  //   // yet. Right now we need just basic character data to display
  //   // them in character selection window.
  //   await account.loadCharacters({ loadContents: false });

  //   // Add characters on the account to the response.
  //   for (let character of account.data.characters.values())
  //   {
  //     if (!character.isValid())
  //     {
  //       ERROR("Invalid character (" + character.getErrorIdString + ")"
  //         + " on account " + account.getErrorIdString() + ". Character"
  //         + " is not added to login response");
  //       continue;
  //     }

  //     response.addCharacter(character);
  //   }

  //   return response;
  // }

  private logReconnectSuccess(account: Account)
  {
    Syslog.log
    (
      this.obtainUserInfo(account) + " has re-logged from different location",
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
  }

  private logLoginSuccess(account: Account)
  {
    Syslog.log
    (
      this.obtainUserInfo(account) + " has logged in",
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
  }

  private sendErrorResponse(connection: Connection)
  {
    const problems: SharedLoginRequest.Problems =
    {
      error: "[ERROR]: Failed to log in.\n\n"
              + Message.ADMINS_WILL_FIX_IT
    };
    
    this.denyRequest(problems, connection);
  }

  // -> Returns 'false' on error.
  private async acceptRequest
  (
    account: Account,
    connection: Connection
  )
  : Promise<boolean>
  {
    let response = new LoginResponse();

    if (!response.setAccount(account))
      return false;

    /// TODO: Tohle dělat jen při tvrdém loginu, ne při reconnectu.
    // // Do not load referenced entities (like inventory contents)
    // // yet. Right now we need just basic character data to display
    // // them in character selection window.
    // await account.loadCharacters({ loadContents: false });

    connection.send(response);

    return true;
  }

  /*
  private async acceptRequest(connection: Connection)
  {
    let response = await this.createOkResponse(account);

    connection.send(response);
  }
  */

  private denyRequest
  (
    problems: SharedLoginRequest.Problems,
    connection: Connection
  )
  {
    let response = new LoginResponse();

    response.setProblems(problems);
    connection.send(response);
  }

  /// To be deleted.
  /*
  private denyRequest
  (
    problem: string,
    result: LoginResponse.Result,
    connection: Connection
  )
  {
    let response = new LoginResponse();

    response.result = result;
    response.setProblems(problem);

    connection.send(response);
  }
  */

  /// To be deleted.
  // private reportMissingIdProperty
  // (
  //   email: string,
  //   connection: Connection
  // )
  // {
  //   this.denyRequest
  //   (
  //     "[ERROR]: Failed to read account data.\n"
  //       + Message.ADMINS_WILL_FIX_IT,
  //     LoginResponse.Result.UNKNOWN_EMAIL,
  //     connection
  //   );

  //   ERROR("Missing or invalid '" + Entity.ID_PROPERTY + "'"
  //     + " property in name lock file of account " + email + " "
  //     + connection.getOrigin());
  // }

  /// To be deleted.
  // private reportMissingPasswordProperty
  // (
  //   email: string,
  //   connection: Connection
  // )
  // {
  //   this.denyRequest
  //   (
  //     "[ERROR]: Failed to read account data.\n"
  //       + Message.ADMINS_WILL_FIX_IT,
  //     LoginResponse.Result.UNKNOWN_EMAIL,
  //     connection
  //   );

  //   ERROR("Missing or invalid '" + NameLock.PASSWORD_HASH_PROPERTY + "'"
  //     + " property in name lock file of account " + email + " "
  //     + connection.getOrigin());
  // }

  /// To be deleted.
  // private isConnectionValid(connection: Connection)
  // {
  //   if (!connection)
  //     return false;

  //   if (connection.account !== null)
  //   {
  //     ERROR("Login request is triggered on connection that has"
  //       + " account (" + connection.account.getErrorIdString() + ")"
  //       + " attached to it. Login request can only be processed"
  //       + " on connection with no account attached yet. Request"
  //       + " is not processed");
  //     return false;
  //   }

  //   return true;
  // }

  /// To be deleted.
  // private isAccountValid(account: Account)
  // {
  //   if (!account)
  //     return false;

  //   if (!account.getConnection())
  //   {
  //     ERROR("Invalid connection on account " + account.getErrorIdString());
  //     return false;
  //   }

  //   return true;
  // }

  /// To be deleted.
  // private reportIncorrectPassword
  // (
  //   userInfo: string,
  //   connection: Connection
  // )
  // {
  //   this.denyRequest
  //   (
  //     "Incorrect password.",
  //     LoginResponse.Result.INCORRECT_PASSWORD,
  //     connection
  //   );

  //   Syslog.log
  //   (
  //     "Bad PW: " + userInfo,
  //     MessageType.CONNECTION_INFO,
  //     AdminLevel.IMMORTAL
  //   );
  // }

  // -> Returns 'false' if error occurs.
  private attachNewConnection
  (
    account: Account,
    newConnection: Connection
  )
  : boolean
  {
    if (!newConnection || !account || !account.isValid())
      return false;

    let oldConnection = account.getConnection();

    if (!oldConnection)
    {
      ERROR("Invalid connection attached to account "
        + account.getErrorIdString());
      return false;
    }

    // Let the old connection know that is has been usurped.
    //   We don't have to worry about not sending this message
    // when player just reloads her broswer tab, because in
    // that case browser closes the old connection before
    // opening a new one so it will be handled as login, not
    // as reconnect.
    oldConnection.announceReconnect();

    oldConnection = account.detachConnection();

    if (!oldConnection)
      return false;

    oldConnection.close();
    account.attachConnection(newConnection);

    return true;
  }

  private findAccountInMemory(): Account | null
  {
    let account = Accounts.get(this.email);
    
    if (!account)
      return null;

    return account;
  }

  private sendWrongPasswordResponse(connection: Connection)
  {
    this.denyRequest
    (
      { loginDenied: "Incorrect password." },
      connection
    );
  }

  private logWrongPasswordAttempt(account: Account)
  {
    Syslog.log
    (
      "Bad PW: " + this.obtainUserInfo(account),
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
  }

  // -> Returns 'false' if error occurs.
  private async attemptToReconnect
  (
    passwordHash: string,
    account: Account,
    connection: Connection
  )
  : Promise<boolean>
  {
    if (!account.isPasswordCorrect(passwordHash))
    {
      this.sendWrongPasswordResponse(connection);
      this.logWrongPasswordAttempt(account);
      return false;
    }

    if (!await this.reconnectToAccount(passwordHash, account, connection))
    {
      this.sendErrorResponse(connection);
      return false;
    }

    if (!await this.acceptRequest(account, connection))
      return false;

    this.logReconnectSuccess(account);

    return true;
  }

  // -> Returns 'false' if error occurs.
  private async reconnectToAccount
  (
    passwordHash: string,
    account: Account,
    connection: Connection
  )
  : Promise<boolean>
  {
    if (!account.isValid())
      return false;

    if (!this.attachNewConnection(account, connection))
      return false;

    return true;
  }

  private reportAccountLoadFailure
  (
    email: string,
    connection: Connection
  )
  {
    this.denyRequest
    (
      "[ERROR]: Failed to load account.\n"
        + Message.ADMINS_WILL_FIX_IT,
      LoginResponse.Result.FAILED_TO_LOAD_ACCOUNT,
      connection
    );
  }

  private reportMissingNameLock(email: string, connection: Connection)
  {
    this.denyRequest
    (
      "No account is registered for this e-mail address.",
      LoginResponse.Result.UNKNOWN_EMAIL,
      connection
    );

    Syslog.log
    (
      "Unregistered player (" + email + ") attempted to log in"
        + " from " + connection.getOrigin(),
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
  }

  private reportNameLockReadError(email: string, connection: Connection)
  {
    this.denyRequest
    (
      "[ERROR]: Failed to read account data.\n"
        + Message.ADMINS_WILL_FIX_IT,
      LoginResponse.Result.UNKNOWN_EMAIL,
      connection
    );

    ERROR("Failed to read name lock file for account"
      + " " + email + " " + connection.getOrigin());
  }

  // -> Returns 'null' on failure.
  private async loadNameLockRecord
  (
    email: string,
    connection: Connection
  )
  : Promise<Object>
  {
    let nameLock = await NameLock.load
    (
      email,    // Use 'email' as account name.
      Entity.NameCathegory[Entity.NameCathegory.ACCOUNT],
      false     // Do not report 'not found' error.
    );

    if (nameLock === undefined)
    {
      this.reportMissingNameLock(email, connection);
      return null;
    }

    if (nameLock === null)
    {
      this.reportNameLockReadError(email, connection);
      return null;
    }

    return nameLock;
  }

  private isNameLockValid(nameLock: Object): boolean
  {
    if (!nameLock)
    {
      ERROR("Invalid 'nameLock'");
      return false;
    }

    return true;
  }

  // -> Returns 'null' on failure.
  private async loadAccount
  (
    nameLock: Object,
    email: string,
    connection: Connection
  )
  : Promise<Account>
  {
    if (!this.isNameLockValid(nameLock))
      return null;

    let id = nameLock[Entity.ID_PROPERTY];

    if (!id)
    {
      this.reportMissingIdProperty(email, connection);
      return null;
    }

    let account = await ServerEntities.loadEntityById
    (
      id,
      Account,  // Typecast.
    );

    if (!account || !account.isValid())
    {
      this.reportAccountLoadFailure(email, connection);
      return null;
    }

    account.addToLists();

    return account;
  }

  private authenticate
  (
    nameLock: Object,
    email: string,
    passwordHash: string,
    connection: Connection
  )
  : boolean
  {
    if (!this.isNameLockValid(nameLock))
      return false;

    let savedPasswordHash = nameLock[NameLock.PASSWORD_HASH_PROPERTY];

    if (!savedPasswordHash)
    {
      this.reportMissingPasswordProperty(email, connection);
      return false;
    }

    if (passwordHash !== nameLock[NameLock.PASSWORD_HASH_PROPERTY])
    {
      let userInfo = email + " " + connection.getOrigin();

      this.sendWrongPasswordResponse(connection);
      this.logWrongPasswordAttempt(account);
      ///this.reportIncorrectPassword(userInfo, connection);
      return false;
    }

    return true;
  }

  private async loadAccountNameLock()
  : Promise<AccountNameLock | null | NameLock.FileDoesNotExist>
  {
    let accountNameLock = await AccountNameLock.load
    (
      this.email,    // Use 'email' as account name.
      Entity.NameCathegory[Entity.NameCathegory.ACCOUNT],
      false     // Do not report 'not found' error.
    );

    if (accountNameLock === undefined)
    {
      return null;
    }

    return accountNameLock;
  }

  // -> Returns 'true' if error occurs.
  private async attemptToLogin
  (
    passwordHash: string,
    connection: Connection
  )
  : Promise<boolean>
  {
    TODO

    /// Ještě je tu možnost, aby tady funkce vrátila rovnou všechna data,
    /// která budu potřebovat (AccountDescription?) nebo null (v případě chyby).
    ///   Respektive...
    /// On to asi může bejt nameLockRecord, páč ten nejspíš přesně tohle
    /// obsahuje... I tak by ale v téhle fci měly bejt kontroly, že v něm
    /// jsou všechny požadované properties. A dál by se mělo pracovat s typem,
    /// kterej má všechny properties !null.
    let accountNameLock = await this.loadAccountNameLock();

    if (accountNameLock === NameLock.OpenFileResult.FILE_DOES_NOT_EXIST)
    {
      ///TODO
      return false;
    }

    if (!accountNameLock)
    {
      this.sendErrorResponse(connection);
      return false;
    }

    /// Tohle nemůže hodit error, ale může být špatně heslo.
    if (!this.authenticate(passwordHash))
    {
      this.sendWrongPasswordResponse(connection);
      this.logWrongPasswordAttempt(account);
      return false;      
    }

    // Tohle opět může hodit error.
    if (!await this.connectToAccount(passwordHash, account, connection))
    {
      this.sendErrorResponse(connection);
      return false;
    }

    if (!await this.acceptRequest(account, connection))
      return false;

    this.logLoginSuccess(account);

    return true;

    


    // let nameLockRecord = await this.loadNameLockRecord(this.email, connection);

    // if (!nameLockRecord)
    //   return false;

    // if (!this.authenticate(nameLockRecord, this.email, passwordHash, connection))
    //   return;

    // let account = await this.loadAccount(nameLockRecord, this.email, connection);

    // if (!account || !account.isValid())
    //   return;

    // account.attachConnection(connection);

    // await this.acceptRequest
    // (
    //   account,
    //   connection,
    //   "has logged in"
    // );
  }

  // -> Returns 'true' if error occurs.
  private async connectToAccount
  (
    passwordHash: string,
    connection: Connection
  )
  : Promise<boolean>
  {
    // let nameLockRecord = await this.loadNameLockRecord(this.email, connection);

    // if (!nameLockRecord)
    //   return;

    // if (!this.authenticate(nameLockRecord, this.email, passwordHash, connection))
    //   return;

    // let account = await this.loadAccount(nameLockRecord, this.email, connection);

    // if (!account || !account.isValid())
    //   return;

    // account.attachConnection(connection);

    // await this.acceptRequest
    // (
    //   account,
    //   connection,
    //   "has logged in"
    // );
  }
}

// ------------------ Type declarations ----------------------

/// Tohle asi nakonec nepoužiju - bude snad stačit nameLockRecord.
interface LoginInfo
{

}

// This overwrites ancestor class.
Classes.registerSerializableClass(LoginRequest);