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
  constructor()
  {
    super();

    this.version = 0;
  }

  // ---------------- Public methods --------------------

  // ~ Overrides Packet.process().
  public async process(connection: Connection)
  {
    let email = this.email;
    // // E-mail address is used as account name but it needs
    // // to be encoded first so it can be used as file name.
    // let accountName = Utils.encodeEmail(email);
    let passwordHash = ServerUtils.md5hash(this.password);

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
    if (await this.reconnectToAccount(email, passwordHash, connection))
      return;

    // If account 'doesn't exist in memory, we need to
    // load it from disk and connect to it.
    //   This also handles situation when user reloads
    // browser tab - browser closes the old connection
    // in such case so at the time user logs back in
    // server has already dealocated old account, connection
    // and socket.
    await this.connectToAccount(email, passwordHash, connection);
  }

  // --------------- Private methods --------------------

  private async createOkResponse(account: Account)
  {
    let response = new LoginResponse();
    response.result = LoginResponse.Result.OK;

    response.setAccount(account);

    // Do not load referenced entities (like inventory contents)
    // yet. Right now we need just basic character data to display
    // them in character selection window.
    await account.loadCharacters({ loadContents: false });

    // Add characters on the account to the response.
    for (let character of account.data.characters.values())
    {
      if (!character.isValid())
      {
        ERROR("Invalid character (" + character.getErrorIdString + ")"
          + " on account " + account.getErrorIdString() + ". Character"
          + " is not added to login response");
        continue;
      }

      response.addCharacter(character);
    }

    return response;
  }

  private async acceptRequest
  (
    account: Account,
    connection: Connection,
    action: string
  )
  {
    let response = await this.createOkResponse(account);

    Syslog.log
    (
      account.getUserInfo() + " " + action,
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );

    connection.send(response);
  }

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

  private reportMissingIdProperty
  (
    email: string,
    connection: Connection
  )
  {
    this.denyRequest
    (
      "[ERROR]: Failed to read account data.\n"
        + Message.ADMINS_WILL_FIX_IT,
      LoginResponse.Result.UNKNOWN_EMAIL,
      connection
    );

    ERROR("Missing or invalid '" + Entity.ID_PROPERTY + "'"
      + " property in name lock file of account " + email + " "
      + connection.getOrigin());
  }

  private reportMissingPasswordProperty
  (
    email: string,
    connection: Connection
  )
  {
    this.denyRequest
    (
      "[ERROR]: Failed to read account data.\n"
        + Message.ADMINS_WILL_FIX_IT,
      LoginResponse.Result.UNKNOWN_EMAIL,
      connection
    );

    ERROR("Missing or invalid '" + NameLock.PASSWORD_HASH_PROPERTY + "'"
      + " property in name lock file of account " + email + " "
      + connection.getOrigin());
  }

  private isConnectionValid(connection: Connection)
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

  private isAccountValid(account: Account)
  {
    if (!account)
      return false;

    if (!account.getConnection())
    {
      ERROR("Invalid connection on account " + account.getErrorIdString());
      return false;
    }

    return true;
  }

  private reportIncorrectPassword
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

  private attachNewConnection
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

  private async reconnectToAccount
  (
    email: string,
    passwordHash: string,
    connection: Connection
  )
  {
    // Check if account is already loaded in memory.
    let account = Accounts.get(email);

    if (!this.isAccountValid(account))
      return false;

    if (!account.validatePassword(passwordHash))
    {
      this.reportIncorrectPassword(account.getUserInfo(), connection);
      return false;
    }

    this.attachNewConnection(account, connection);

    await this.acceptRequest
    (
      account,
      connection,
      "has re-logged from different location"
    );

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
  private async loadNameLock
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

    if (!account)
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

      this.reportIncorrectPassword(userInfo, connection);
      return false;
    }

    return true;
  }

  private async connectToAccount
  (
    email: string,
    passwordHash: string,
    connection: Connection
  )
  {
    let nameLock = await this.loadNameLock(email, connection);

    if (!nameLock)
      return;

    if (!this.authenticate(nameLock, email, passwordHash, connection))
      return;

    let account = await this.loadAccount(nameLock, email, connection);

    if (!account)
      return;

    account.attachConnection(connection);

    await this.acceptRequest
    (
      account,
      connection,
      "has logged in"
    );
  }
}

// This overwrites ancestor class.
Classes.registerSerializableClass(LoginRequest);