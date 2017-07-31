/*
  Part of BrutusNEXT

  Player account creation.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {ServerUtils} from '../../../server/lib/utils/ServerUtils';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {Account} from '../../../server/lib/account/Account';
import {Accounts} from '../../../server/lib/account/Accounts';
import {Connection} from '../../../server/lib/connection/Connection';
import {RegisterRequest} from '../../../shared/lib/protocol/RegisterRequest';
import {RegisterResponse} from '../../../shared/lib/protocol/RegisterResponse';

export class Register
{
  // ------------- Public static methods ----------------

  public static async processRequest
  (
    request: RegisterRequest,
    connection: Connection
  )
  {
    if (!this.isRequestValid(request, connection))
      return;

    await this.processAccountCreation
    (
      // Email is used as account name.
      request.email,
      // Only hash is stored, not original password.
      ServerUtils.md5hash(request.password),
      connection
    );
  }

  // ------------- Private static methods ---------------

  private static reportCreationFailure
  (
    account: Account,
    accountName,
    connection: Connection
  )
  {
    this.denyRequest
    (
      "[ERROR]: Failed to create account.\n\n"
        + Message.ADMINS_WILL_FIX_IT,
      RegisterResponse.Result.FAILED_TO_CREATE_ACCOUNT,
      connection
    );

    ERROR("Failed to create account '" + accountName + "'");
  }

  private static reportAccountAlreadyExists
  (
    account: Account,
    accountName: string,
    connection: Connection
  )
  {
    this.denyRequest
    (
      "An account is already registered to this e-mail address.",
      RegisterResponse.Result.EMAIL_PROBLEM,
      connection
    );

    Syslog.log
    (
      "Attempt to register already registered e-mail " + accountName
        + " from " + connection.getOrigin(),
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
  }

  private static existsInMemory(accountName: string)
  {
    if (Accounts.has(accountName))
    {
      ERROR("Attempt to register account '" + accountName + "'"
        + " which is already loaded to memory. Account is not"
        + " registered");
      return true;
    }

    return false;
  }

  private static async processAccountCreation
  (
    accountName: string,
    passwordHash: string,
    connection: Connection
  )
  {
    let account = await this.createAccount
    (
      accountName,
      passwordHash,
      connection
    );

    // 'undefined' means that the name is already taken.
    if (account === undefined)
    {
      this.reportAccountAlreadyExists(account, accountName, connection);
      return;
    }

    // 'null' means that an error occured.
    if (account === undefined)
    {
      this.reportCreationFailure(account, accountName, connection);
      return;
    }

    this.initAccount(account, passwordHash, connection);

    await ServerEntities.save(account);
    
    this.acceptRequest(account, connection);
  }

  // -> Returns 'null' on failure, 'undefined' if account already exists.
  private static async createAccount
  (
    accountName: string,
    passwordHash: string,
    connection: Connection
  )
  {
    if (!connection)
    {
      ERROR("Invalid connection");
      return null;
    }

    if (this.existsInMemory(accountName))
      return undefined;

    return await ServerEntities.createInstanceEntity
    (
      Account,
      Account.name,   // Prototype name.
      accountName,
      Entity.NameCathegory.ACCOUNT,
      passwordHash
    );
  }

  private static initAccount
  (
    account: Account,
    passwordHash: string,
    connection: Connection
  )
  {
    account.setPasswordHash(passwordHash);
    account.addToLists();

    account.attachConnection(connection);
  }

  private static acceptRequest(account: Account, connection: Connection)
  {
    let response = new RegisterResponse();
    response.result = RegisterResponse.Result.OK;
    
    // Add newly created account to the response.
    response.account.serializeEntity
    (
      account,
      Serializable.Mode.SEND_TO_CLIENT
    );

    Syslog.log
    (
      "New player: " + account.getUserInfo(),
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );
    
    connection.send(response);
  }

  private static denyRequest
  (
    problem: string,
    result: RegisterResponse.Result,
    connection: Connection
  )
  {
    let response = new RegisterResponse();

    response.result = result;
    response.problem = problem;

    connection.send(response);
  }

  private static isEmailValid
  (
    request: RegisterRequest,
    connection: Connection
  )
  : boolean
  {
    let problem = request.getEmailProblem();

    if (!problem)
      return true;

    this.denyRequest
    (
      problem,
      RegisterResponse.Result.EMAIL_PROBLEM,
      connection
    );

    Syslog.log
    (
      "Attempt to register invalid e-mail address " + request.email + "."
        + " Problem: " + problem,
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
    
    return false;
  }

  private static isPasswordValid
  (
    request: RegisterRequest,
    connection: Connection
  )
  : boolean
  {
    let problem = request.getEmailProblem();

    if (!problem)
      return true;

    this.denyRequest
    (
      problem,
      RegisterResponse.Result.PASSWORD_PROBLEM,
      connection
    );

    Syslog.log
    (
      "Attempt to register account " + request.email
        + " " + connection.getOrigin() + " using"
        + " invalid password. Problem: " + problem,
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );

    return false;
  }

  private static isRequestValid
  (
    request: RegisterRequest,
    connection: Connection
  )
  : boolean
  {
    if (!this.isEmailValid(request, connection))
      return false;

    if (!this.isPasswordValid(request, connection))
      return false;

    return true;
  }
}
