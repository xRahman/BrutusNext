/*
  Part of BrutusNEXT

  Server-side functionality related to login request packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {SharedLoginRequest} from
  '../../../shared/lib/protocol/SharedLoginRequest';
import {ServerUtils} from '../../../server/lib/utils/ServerUtils';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {NameLock} from '../../../server/lib/entity/NameLock';
import {AccountNameLock} from '../../../server/lib/account/AccountNameLock';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {Character} from '../../../server/game/character/Character';
import {Message} from '../../../server/lib/message/Message';
import {Account} from '../../../server/lib/account/Account';
import {Accounts} from '../../../server/lib/account/Accounts';
import {Connection} from '../../../server/lib/connection/Connection';
import {LoginResponse} from '../../../server/lib/protocol/LoginResponse';
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
    // login request (for example if she is logs in from different
    // computer or browser tab while still being logged in from
    // the old location), her Account is still loaded in memory
    // (because it is kept there as long as connection stays open).
    let account = this.findAccountInMemory();

    // In such case, we don't need to load account from disk but
    // we need to close the old connection and socket and also
    // possibly let the player know that her connection has just
    // been usurped.
    if (account)
      return await this.reconnect(passwordHash, account, connection);

    // If account 'doesn't exist in memory, we need to
    // load it from disk and connect to it.
    //   This also handles situation when user reloads
    // browser tab - browser closes the old connection
    // in such case so at the time user logs back the
    // server has already dealocated old account, connection
    // and socket.
    return await this.login(passwordHash, connection);
  }

  // --------------- Private methods --------------------

  // This should not be sent to user because it may may
  // return an error string that includes account entity id.
  private obtainUserInfo(account: Account): string
  {
    let userInfo = account.getUserInfo();

    if (!userInfo)
      return account.getErrorIdString();

    return userInfo;
  }

  private logReconnectSuccess(account: Account)
  {
    Syslog.logConnectionInfo
    (
      this.obtainUserInfo(account) + " has re-logged from different location"
    );
  }

  private logLoginSuccess(account: Account)
  {
    Syslog.logConnectionInfo(this.obtainUserInfo(account) + " has logged in");
  }

  private sendErrorResponse(connection: Connection)
  {
    this.denyRequest
    (
      {
        error: "[ERROR]: Failed to log in.\n\n" + Message.ADMINS_WILL_FIX_IT
      },
      connection
    );
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

    if (!response.serializeAccount(account))
      return false;

    connection.send(response);

    return true;
  }

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

  // -> Returns 'null' if account isn't loaded in memory.
  private findAccountInMemory(): Account | null
  {
    let account = Accounts.get(this.email);
    
    if (!account)
      return null;

    return account;
  }

  private sendWrongPasswordResponse(connection: Connection)
  {
    this.sendLoginProblemResponse("Incorrect password.", connection);
  }

  private sendLoginProblemResponse(problem: string, connection: Connection)
  {
    this.denyRequest
    (
      { loginProblem: problem },
      connection
    );
  }

  private logWrongPasswordAttempt(userInfo: string)
  {
    Syslog.logConnectionInfo("Bad PW: " + userInfo);
  }

  // -> Returns 'false' if error occurs.
  private async reconnect
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
      this.logWrongPasswordAttempt(this.obtainUserInfo(account));
      return false;
    }

    if (!await this.reconnectToAccount(passwordHash, account, connection))
    {
      this.sendErrorResponse(connection);
      return false;
    }

    if (!await this.acceptRequest(account, connection))
    {
      this.sendErrorResponse(connection);
      return false;
    }

    this.logReconnectSuccess(account);

    return true;
  }

  // -> Returns 'false' if error occurs.
  private async reconnectToAccount
  (
    passwordHash: string,
    account: Account,
    newConnection: Connection
  )
  : Promise<boolean>
  {
    if (!account.isValid())
      return false;

    let oldConnection = account.detachConnection();

    if (!oldConnection)
       return false;

    oldConnection.announceReconnect();
    oldConnection.close();
    account.attachConnection(newConnection);

    return true;
  }

  private sendNoSuchAccountResponse(connection: Connection)
  {
    this.sendLoginProblemResponse
    (
      "No account is registered for this e-mail address.",
      connection
    );
  }

  private logNoSuchAccountExists(email: string, connection: Connection)
  {
    Syslog.logConnectionInfo
    (
      "Unregistered player (" + email + ") attempted to log in"
        + " from " + connection.getOrigin()
    );
  }

  // -> Returns 'null' on failure.
  private async loadAccount
  (
    accountNameLock: AccountNameLock,
    connection: Connection
  )
  : Promise<Account | null>
  {
    let id = accountNameLock.id;

    if (!id)
    {
      ERROR("Missing or invalid '" + Entity.ID_PROPERTY + "'"
         + " property in name lock file of account " + this.email + " "
         + connection.getOrigin());
      return null;
    }

    let account = await ServerEntities.loadEntityById
    (
      id,
      Account,  // Typecast.
    );

    if (!account || !account.isValid())
      return null;

    account.addToLists();

    return account;
  }

  // -> Returns 'true' if the password is correct.
  private isPasswordCorrect
  (
    accountNameLock: AccountNameLock,
    passwordHash: string
  )
  : boolean
  {
    return passwordHash === accountNameLock.passwordHash;
  }

  private async loadAccountNameLock(): Promise<AccountNameLock.LoadResult>
  {
    return await AccountNameLock.load
    (
      this.email,    // Use 'email' as account name.
      Entity.NameCathegory[Entity.NameCathegory.ACCOUNT],
      false     // Do not report 'not found' error.
    );
  }

  private async loginAttempt
  (
    passwordHash: string,
    connection: Connection
  )
  : Promise<Account | "ERROR" | "NO_SUCH_ACCOUNT" | "WRONG_PASSWORD">
  {
    // Password hash is stored in account name lock file so we don't
    // need to load whole account in order to check password.
    let loadResult = await this.loadAccountNameLock();

    if (loadResult === "FILE_DOES_NOT_EXIST")
      return "NO_SUCH_ACCOUNT";

    if (loadResult === "ERROR")
      return "ERROR";

    let accountNameLock: AccountNameLock = loadResult;

    if (!this.isPasswordCorrect(accountNameLock, passwordHash))
      return "WRONG_PASSWORD";      

    return await this.connectToAccount(accountNameLock, connection);
  }

  // -> Returns 'true' if error occurs.
  private async login
  (
    passwordHash: string,
    connection: Connection
  )
  : Promise<boolean>
  {
    let loginResult = await this.loginAttempt(passwordHash, connection);

    if (loginResult === "NO_SUCH_ACCOUNT")
    {
      this.sendNoSuchAccountResponse(connection);
      this.logNoSuchAccountExists(this.email, connection);
      return false;
    }

    if (loginResult === "ERROR")
    {
      this.sendErrorResponse(connection);
      return false;
    }

    if (loginResult === "WRONG_PASSWORD")
    {
      this.sendWrongPasswordResponse(connection);
      this.logWrongPasswordAttempt(this.email);
      return false;
    }

    let account: Account = loginResult;

    // Load characters on account to memory so they will be
    // included in response. But don't load their contents
    // (items etc.) yet because user will only enter game with
    // one of them so we don't need keep this information in
    // memory for all of them.
    await account.loadCharacters({ loadContents: false });

    if (!await this.acceptRequest(account, connection))
    {
      this.sendErrorResponse(connection);
      return false;
    }

    this.logLoginSuccess(account);

    return true;
  }

  // -> Returns 'null' on error.
  private async connectToAccount
  (
    accountNameLock: AccountNameLock,
    connection: Connection
  )
  : Promise<Account | "ERROR">
  {
    let account = await this.loadAccount(accountNameLock, connection);

    if (!account || !account.isValid())
      return "ERROR";

    account.attachConnection(connection);

    return account;
  }
}

// ------------------ Type declarations ----------------------

export module LoginRequest
{
  export type LoginResult = Account | "ERROR" | "NO_SUCH_ACCOUNT";
}

Classes.registerSerializableClass(LoginRequest);