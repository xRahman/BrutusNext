/*
  Part of BrutusNEXT

  Player login.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {ServerUtils} from '../../../server/lib/utils/ServerUtils';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {NameLock} from '../../../server/lib/entity/NameLock';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Account} from '../../../server/lib/account/Account';
import {Accounts} from '../../../server/lib/account/Accounts';
import {Connection} from '../../../server/lib/connection/Connection';
import {LoginRequest} from '../../../shared/lib/protocol/LoginRequest';
import {LoginResponse} from '../../../shared/lib/protocol/LoginResponse';

export class Login
{
  // ------------- Public static methods ----------------

  public static async processRequest
  (
    request: LoginRequest,
    connection: Connection
  )
  {
    if (!this.isConnectionValid(connection))
      return;

    let email = request.email;
    // E-mail address is used as account name but it needs
    // to be encoded first so it can be used as file name.
    let accountName = Utils.encodeEmail(email);
    let passwordHash = ServerUtils.md5hash(request.password);

    // If player has already been connected prior to this
    // login request (for example if she logs in from different
    // computer or browser tab while still being logged-in from
    // the old location), her Account is still loaded in memory
    // (because it is kept there as long as connection stays open).
    //   In such case, we don't need to load account from disk
    // (because it's already loaded) but we need to close the
    // old connection and socket (if it's still open) and also
    // possibly let the player know that her connection has been
    // usurped.
    if (this.reconnectToAccount(accountName, passwordHash, connection))
      return;

    // If account 'accountName' doesn't exist in memory,
    // we need to load it from disk and connect to it.
    // This also handles situation when user reloads
    // browser tab - browser closes the old connection
    // in such case so at the time user logs back in
    // server has already dealocated old account, connection
    // and socket.
    await this.connectToAccount(accountName, email, passwordHash, connection);
  }

  // ------------- Private static methods ---------------

  private static acceptRequest
  (
    account: Account,
    connection: Connection,
    action: string
  )
  {
    let response = new LoginResponse();
    response.result = LoginResponse.Result.OK;
    
    // Add newly created account to the response.
    response.account.serializeEntity
    (
      account,
      Serializable.Mode.SEND_TO_CLIENT
    );

    Syslog.log
    (
      account.getUserInfo() + " " + action,
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );

    connection.send(response);
  }

  private static denyRequest
  (
    problem: string,
    result: LoginResponse.Result,
    connection: Connection
  )
  {
    let response = new LoginResponse();

    response.result = result;
    response.problem = problem;

    connection.send(response);
  }

  private static reportMissingIdProperty
  (
    email: string,
    connection: Connection
  )
  {
    this.denyRequest
    (
      "[ERROR]: Failed to read account data."
        + Message.ADMINS_WILL_FIX_IT,
      LoginResponse.Result.UNKNOWN_EMAIL,
      connection
    );

    ERROR("Missing or invalid '" + Entity.ID_PROPERTY + "'"
      + " property in name lock file of account " + email + " "
      + connection.getOrigin());
  }

  private static reportMissingPasswordProperty
  (
    email: string,
    connection: Connection
  )
  {
    this.denyRequest
    (
      "[ERROR]: Failed to read account data."
        + Message.ADMINS_WILL_FIX_IT,
      LoginResponse.Result.UNKNOWN_EMAIL,
      connection
    );

    ERROR("Missing or invalid '" + NameLock.PASSWORD_HASH_PROPERTY + "'"
      + " property in name lock file of account " + email + " "
      + connection.getOrigin());
  }

  private static isConnectionValid(connection: Connection)
  {
    if (!connection)
      return false;

    if (connection.account !== null)
    {
      ERROR("Login request is triggered on connection that has"
        + " account (" + connection.account.getErrorIdString() + ")"
        + " attached to it. Login request can only be processed"
        + " on connection with no account attached yet. Request"
        + " is not processed");
      return false;
    }

    return true;
  }

  private static isAccountValid(account: Account)
  {
    if (!account)
      return false;

    if (!account.getConnection())
    {
      // This should never happen.
      ERROR("Invalid connection on account " + account.getErrorIdString());
      return false;
    }

    return true;
  }

  private static reportInvalidPassword
  (
    userInfo: string,
    connection: Connection
  )
  {
    this.denyRequest
    (
      "Incorrect password.",
      LoginResponse.Result.INCORRECT_PASSWORD,
      connection
    );

    Syslog.log
    (
      "Bad PW: " + userInfo,
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
  }

  private static attachNewConnection
  (
    account: Account,
    connection: Connection
  )
  {
    // Let the old connection know that is has been usurped
    // (we don't have to worry about not sending this message
    //  when player just reloads her broswer tab, because in
    //  that case browser closes the old connection so the serves
    //  has already dealocated the account so connectToAccount()
    //  has been called rather than reconnectToAccount().
    account.getConnection().announceReconnect();
    account.detachConnection().close();
    account.attachConnection(connection);
  }

  private static reconnectToAccount
  (
    accountName: string,
    passwordHash: string,
    connection: Connection
  )
  {
    // Check if account is already loaded in memory.
    let account = Accounts.get(accountName);

    if (!this.isAccountValid(account))
      return false;

    if (!account.validatePassword(passwordHash))
    {
      this.reportInvalidPassword(account.getUserInfo(), connection);
      return false;
    }

    this.attachNewConnection(account, connection);
    this.acceptRequest
    (
      account,
      connection,
      "has re-logged from different location"
    );

    return true;
  }

  private static reportAccountLoadFailure
  (
    email: string,
    connection: Connection
  )
  {
    this.denyRequest
    (
      "[ERROR]: Failed to load account."
        + Message.ADMINS_WILL_FIX_IT,
      LoginResponse.Result.FAILED_TO_LOAD_ACCOUNT,
      connection
    );
  }

  private static reportMissingNameLock(email: string, connection: Connection)
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

  private static reportNameLockReadError(email: string, connection: Connection)
  {
    this.denyRequest
    (
      "[ERROR]: Failed to read account data."
        + Message.ADMINS_WILL_FIX_IT,
      LoginResponse.Result.UNKNOWN_EMAIL,
      connection
    );

    ERROR("Failed to read name lock file for account"
      + " " + email + " " + connection.getOrigin());
  }

  // -> Returns 'null' on failure.
  private static async loadNameLock
  (
    accountName: string,
    email: string,
    connection: Connection
  )
  : Promise<Object>
  {
    let nameLock = await NameLock.load
    (
      accountName,
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

  private static isNameLockValid(nameLock: Object): boolean
  {
    if (!nameLock)
    {
      ERROR("Invalid 'nameLock'");
      return false;
    }

    return true;
  }

  // -> Returns 'null' on failure.
  private static async loadAccount
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

    if (!account)
    {
      this.reportAccountLoadFailure(email, connection);
      return null;
    }

    account.addToLists();

    return account;
  }

  private static authenticate
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

      this.reportInvalidPassword(userInfo, connection);
      return false;
    }

    return true;
  }

  private static async connectToAccount
  (
    accountName: string,
    email: string,
    passwordHash: string,
    connection: Connection
  )
  {
    let nameLock = await this.loadNameLock(accountName, email, connection);

    if (!nameLock)
      return;

    if (!this.authenticate(nameLock, email, passwordHash, connection))
      return;

    let account = await this.loadAccount(nameLock, email, connection);

    if (!account)
      return;

    account.attachConnection(connection);
    this.acceptRequest
    (
      account,
      connection,
      "has logged in"
    );
  }
}