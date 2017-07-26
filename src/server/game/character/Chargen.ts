/*
  Part of BrutusNEXT

  Character creation.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
// import {Utils} from '../../../shared/lib/utils/Utils';
// import {ServerUtils} from '../../../server/lib/utils/ServerUtils';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
// import {Serializable} from '../../../shared/lib/class/Serializable';
// import {NameLock} from '../../../server/lib/entity/NameLock';
// import {Entity} from '../../../shared/lib/entity/Entity';
// import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
// import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
// import {Account} from '../../../server/lib/account/Account';
// import {Accounts} from '../../../server/lib/account/Accounts';
import {Connection} from '../../../server/lib/connection/Connection';
import {ChargenRequest} from '../../../shared/lib/protocol/ChargenRequest';
import {ChargenResponse} from '../../../shared/lib/protocol/ChargenResponse';

export class Chargen
{
  // ------------- Public static methods ----------------

  public static async processRequest
  (
    request: ChargenRequest,
    connection: Connection
  )
  {
    if (!this.isConnectionValid(connection))
      return;

    if (!this.isRequestValid(request, connection))
      return;

    await this.createCharacter(request, connection);
  }

  // ------------- Private static methods ---------------

  private static async createCharacter
  (
    request: ChargenRequest,
    connection: Connection
  )
  {
    let characterName = request.characterName;

    /// TODO
  }

  private static isRequestValid
  (
    request: ChargenRequest,
    connection: Connection
  )
  : boolean
  {
    if (!this.isCharacterNameValid(request, connection))
      return false;

    return true;
  }

  private static isCharacterNameValid
  (
    request: ChargenRequest,
    connection: Connection
  )
  : boolean
  {
    let problem = request.getCharacterNameProblem();

    if (!problem)
      return true;

    this.denyRequest
    (
      problem,
      ChargenResponse.Result.CHARACTER_NAME_PROBLEM,
      connection
    );

    Syslog.log
    (
      "Attempt to create character with invalid name"
        + " (" + request.characterName + ")."
        + " Problem: " + problem,
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
    
    return false;
  }

  // private static acceptRequest(account: Account, connection: Connection)
  // {
  //   let response = new LoginResponse();
  //   response.result = LoginResponse.Result.OK;
    
  //   // Add newly created account to the response.
  //   response.account.serializeEntity
  //   (
  //     account,
  //     Serializable.Mode.SEND_TO_CLIENT
  //   );

  //   connection.send(response);
  // }

  private static denyRequest
  (
    problem: string,
    result: ChargenResponse.Result,
    connection: Connection
  )
  {
    let response = new ChargenResponse();

    response.result = result;
    response.problem = problem;

    connection.send(response);
  }

  // // -> Returns 'null'.
  // private static reportMissingIdProperty
  // (
  //   email: string,
  //   connection: Connection
  // )
  // {
  //   this.denyRequest
  //   (
  //     "[ERROR]: Failed to read account data."
  //       + Message.ADMINS_WILL_FIX_IT,
  //     LoginResponse.Result.UNKNOWN_EMAIL,
  //     connection
  //   );

  //   ERROR("Missing or invalid '" + Entity.ID_PROPERTY + "'"
  //     + " property in name lock file of account " + email + " "
  //     + connection.getOrigin());

  //   return null;
  // }

  // // -> Returns 'false'.
  // private static reportMissingPasswordProperty
  // (
  //   email: string,
  //   connection: Connection
  // )
  // {
  //   this.denyRequest
  //   (
  //     "[ERROR]: Failed to read account data."
  //       + Message.ADMINS_WILL_FIX_IT,
  //     LoginResponse.Result.UNKNOWN_EMAIL,
  //     connection
  //   );

  //   ERROR("Missing or invalid '" + NameLock.PASSWORD_HASH_PROPERTY + "'"
  //     + " property in name lock file of account " + email + " "
  //     + connection.getOrigin());

  //   return false;
  // }

  private static isConnectionValid(connection: Connection)
  {
    if (!connection)
      return false;

    if (connection.account === null)
    {
      ERROR("Chargen request is triggered on connection that has"
        + " no account attached to it. Request is not processed");
      return false;
    }

    return true;
  }

  // private static isAccountValid(account: Account)
  // {
  //   if (!account)
  //     return false;

  //   if (!account.getConnection())
  //   {
  //     // This should never happen.
  //     ERROR("Invalid connection on account " + account.getErrorIdString());
  //     return false;
  //   }

  //   return true;
  // }

  // // -> Returns 'false';
  // private static reportInvalidPassword
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

  //   return false;
  // }

  // private static attachNewConnection
  // (
  //   account: Account,
  //   connection: Connection
  // )
  // {
  //   // Let the old connection know that is has been usurped
  //   // (we don't have to worry about not sending this message
  //   //  when player just reloads her broswer tab, because in
  //   //  that case browser closes the old connection so the serves
  //   //  has already dealocated the account so connectToAccount()
  //   //  has been called rather than reconnectToAccount().
  //   account.getConnection().announceReconnect();
  //   account.detachConnection().close();
  //   account.attachConnection(connection);
  // }

  // private static reconnectToAccount
  // (
  //   accountName: string,
  //   passwordHash: string,
  //   connection: Connection
  // )
  // {
  //   // Check if account is already loaded in memory.
  //   let account = Accounts.get(accountName);

  //   if (!this.isAccountValid(account))
  //     return false;

  //   if (!account.validatePassword(passwordHash))
  //     return this.reportInvalidPassword(account.getUserInfo(), connection);

  //   this.attachNewConnection(account, connection);
  //   this.acceptRequest(account, connection);

  //   Syslog.log
  //   (
  //     account.getUserInfo() + " has re-logged from a different location",
  //     MessageType.CONNECTION_INFO,
  //     AdminLevel.IMMORTAL
  //   );

  //   return true;
  // }

  // // -> Returns 'null'.
  // private static reportAccountLoadFailure
  // (
  //   email: string,
  //   connection: Connection
  // )
  // {
  //   this.denyRequest
  //   (
  //     "[ERROR]: Failed to load account."
  //       + Message.ADMINS_WILL_FIX_IT,
  //     LoginResponse.Result.FAILED_TO_LOAD_ACCOUNT,
  //     connection
  //   );

  //   return null;
  // }

  // // -> Returns 'null'.
  // private static reportMissingNameLock(email: string, connection: Connection)
  // {
  //   this.denyRequest
  //   (
  //     "No account is registered for this e-mail address.",
  //     LoginResponse.Result.UNKNOWN_EMAIL,
  //     connection
  //   );

  //   Syslog.log
  //   (
  //     "Unregistered player (" + email + ") attempted to log in"
  //       + " from " + connection.getOrigin(),
  //     MessageType.CONNECTION_INFO,
  //     AdminLevel.IMMORTAL
  //   );

  //   return null;
  // }

  // // -> Returns 'null'.
  // private static reportNameLockReadError(email: string, connection: Connection)
  // {
  //   this.denyRequest
  //   (
  //     "[ERROR]: Failed to read account data."
  //       + Message.ADMINS_WILL_FIX_IT,
  //     LoginResponse.Result.UNKNOWN_EMAIL,
  //     connection
  //   );

  //   ERROR("Failed to read name lock file for account"
  //     + " " + email + " " + connection.getOrigin());

  //   return null;
  // }

  // private static async loadNameLock
  // (
  //   accountName: string,
  //   email: string,
  //   connection: Connection
  // )
  // : Promise<Object>
  // {
  //   let nameLock = await NameLock.load
  //   (
  //     accountName,
  //     Entity.NameCathegory[Entity.NameCathegory.ACCOUNT],
  //     false     // Do not report 'not found' error.
  //   );

  //   if (nameLock === undefined)
  //     return this.reportMissingNameLock(email, connection);

  //   if (nameLock === null)
  //     return this.reportNameLockReadError(email, connection);

  //   return nameLock;
  // }

  // private static nameLockSanityCheck(nameLock: Object): boolean
  // {
  //   if (!nameLock)
  //   {
  //     // This should already be handled.
  //     ERROR("Invalid 'nameLock'");
  //     return false;
  //   }

  //   return true;
  // }

  // private static async loadAccount
  // (
  //   nameLock: Object,
  //   email: string,
  //   connection: Connection
  // )
  // : Promise<Account>
  // {
  //   if (!this.nameLockSanityCheck(nameLock))
  //     return null;

  //   let id = nameLock[Entity.ID_PROPERTY];

  //   if (!id)
  //     return this.reportMissingIdProperty(email, connection);

  //   let account = await ServerEntities.loadEntityById
  //   (
  //     id,
  //     Account,  // Typecast.
  //   );

  //   if (!account)
  //     return this.reportAccountLoadFailure(email, connection);

  //   account.addToLists();

  //   return account;
  // }

  // private static authenticate
  // (
  //   nameLock: Object,
  //   email: string,
  //   passwordHash: string,
  //   connection: Connection
  // )
  // : boolean
  // {
  //   if (!this.nameLockSanityCheck(nameLock))
  //     return null;

  //   let savedPasswordHash = nameLock[NameLock.PASSWORD_HASH_PROPERTY];

  //   if (!savedPasswordHash)
  //     return this.reportMissingPasswordProperty(email, connection);

  //   if (passwordHash !== nameLock[NameLock.PASSWORD_HASH_PROPERTY])
  //   {
  //     let userInfo = email + " " + connection.getOrigin();
  //     return this.reportInvalidPassword(userInfo, connection);
  //   }

  //   return true;
  // }

  // private static async connectToAccount
  // (
  //   accountName: string,
  //   email: string,
  //   passwordHash: string,
  //   connection: Connection
  // )
  // {
  //   let nameLock = await this.loadNameLock(accountName, email, connection);

  //   if (!nameLock)
  //     return;

  //   if (!this.authenticate(nameLock, email, passwordHash, connection))
  //     return;

  //   let account = await this.loadAccount(nameLock, email, connection);

  //   if (!account)
  //     return;

  //   account.attachConnection(connection);
  //   this.acceptRequest(account, connection);

  //   Syslog.log
  //   (
  //     account.getUserInfo() + " has logged in",
  //     MessageType.CONNECTION_INFO,
  //     AdminLevel.IMMORTAL
  //   );
  // }
}
