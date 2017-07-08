/*
  Part of BrutusNEXT

  Registration of a new player account.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {Account} from '../../../server/lib/account/Account';
import {Accounts} from '../../../server/lib/account/Accounts';
import {Connection} from '../../../server/lib/net/Connection';
import {RegisterRequest} from '../../../shared/lib/protocol/RegisterRequest';
import {RegisterResponse} from '../../../shared/lib/protocol/RegisterResponse';

export class Register
{
  // ----------------- Public data ----------------------

  // ----------------- Private data ---------------------

  // --------------- Public accessors -------------------

  // ------------- Public static methods ----------------

  public static async processRequest
  (
    request: RegisterRequest,
    connection: Connection
  )
  {
    if (!this.isRequestOk(request, connection))
      return;

    // Encode email address so it can be used as file name
    // (this usualy does nothing because characters that are
    //  not allowed in email addresss are rarely used in e-mail
    //  address - but better be sure).
    let accountName = Utils.encodeEmail(request.email);
    let password = request.password;
    let account: Account = null;

    account = await this.register(accountName, password, connection);

    if (this.alreadyExists(account, request.email, connection))
      return;

    if (this.failedToCreate(account, connection))
      return;

    this.acceptRequest(account, connection);

    Syslog.log
    (
      "New player: " + account.getUserInfo(),
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
  }

  // ------------- Private static methods ---------------

  private static failedToCreate
  (
    account: Account,
    connection: Connection
  )
  : boolean
  {
    if (account !== null)
      return false;

    this.denyRequest
    (
      "[ERROR]: Failed to create account.\n\n"
        + Message.ADMINS_WILL_FIX_IT,
      RegisterResponse.Result.FAILED_TO_CREATE_ACCOUNT,
      connection
    );

    return true;
  }

  private static alreadyExists
  (
    account: Account,
    email: string,
    connection: Connection
  )
  : boolean
  {
    // 'undefined' means that the name is already taken.
    if (account !== undefined)
      return false;

    this.denyRequest
    (
      "An account is already registered to this e-mail address.",
      RegisterResponse.Result.EMAIL_PROBLEM,
      connection
    );

    Syslog.log
    (
      "Attempt to register already registered e-mail " + email
        + " from " + connection.getOrigin(),
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );

    return true;
  }

  // -> Returns 'null' on failure.
  // -> Returns 'undefined' if requested unique name is already taken.
  private static async register
  (
    accountName: string,
    password: string,
    connection: Connection
  )
  {
    if (!connection)
    {
      ERROR("Invalid connection");
      return null;
    }

    if (Accounts.has(accountName))
    {
      ERROR("Attempt to register account '" + accountName + "'"
        + " which is already loaded to memory. Account is not"
        + " registered");
      return null;
    }

    let account = await ServerEntities.createInstanceEntity
    (
      Account,
      Account.name,   // Prototype name.
      accountName,
      Entity.NameCathegory.ACCOUNT
    );

    // 'undefined' means that the name is already taken.
    if (account === undefined)
      return undefined;

    if (!Entity.isValid(account))
    {
      ERROR("Failed to create account '" + accountName + "'");
      return null;
    }

    account.setPasswordHash(password);
    account.attachConnection(connection);
    account.addToLists();

    await ServerEntities.save(account);

    return account;
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

  private static isEmailOk
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

  private static isPasswordOk
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

  private static isRequestOk
  (
    request: RegisterRequest,
    connection: Connection
  )
  : boolean
  {
    if (!this.isEmailOk(request, connection))
      return false;

    if (!this.isPasswordOk(request, connection))
      return false;

    return true;
  }

  // ---------------- Public methods --------------------

  // --------------- Private methods --------------------
}
