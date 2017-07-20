/*
  Part of BrutusNEXT

  Registration of a new player account.
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
import {Connection} from '../../../server/lib/net/Connection';
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

    // Encode email address so it can be used as file name
    // (this usualy does nothing because characters that are
    //  not allowed in email addresss are rarely used in e-mail
    //  address - but better be sure).
    // Also lowercase it to prevent creating two accounts differing
    // just in character case on Linux (file names are lowercased
    // before saving anyways but better be sure).
    let accountName = Utils.encodeEmail(request.email).toLowerCase();
    // Only hash is stored, not original password.
    let passwordHash = ServerUtils.md5hash(request.password);

    let account = await this.registerAccount
    (
      accountName,
      request.email,
      passwordHash,
      connection
    );

    if (!account)
      return;

    account.attachConnection(connection);
    this.acceptRequest(account, connection);

    Syslog.log
    (
      "New player: " + account.getUserInfo(),
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
  }

  // ------------- Private static methods ---------------

  // -> Returns 'null'.
  private static reportCreationFailure
  (
    account: Account,
    accountName,
    connection: Connection
  )
  : boolean
  {
    this.denyRequest
    (
      "[ERROR]: Failed to create account.\n\n"
        + Message.ADMINS_WILL_FIX_IT,
      RegisterResponse.Result.FAILED_TO_CREATE_ACCOUNT,
      connection
    );

    ERROR("Failed to create account '" + accountName + "'");

    return null;
  }

  // -> Returns 'null'.
  private static reportAccountAlreadyExists
  (
    account: Account,
    email: string,
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
      "Attempt to register already registered e-mail " + email
        + " from " + connection.getOrigin(),
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );

    return null;
  }

  private static registerSanityCheck
  (
    accountName: string,
    connection: Connection
  )
  {
    if (!connection)
    {
      ERROR("Invalid connection");
      return false;
    }

    if (Accounts.has(accountName))
    {
      ERROR("Attempt to register account '" + accountName + "'"
        + " which is already loaded to memory. Account is not"
        + " registered");
      return false;
    }

    return true;
  }

  // -> Returns 'null' on failure.
  private static async registerAccount
  (
    accountName: string,
    email: string,
    passwordHash: string,
    connection: Connection
  )
  {
    if (!this.registerSanityCheck(accountName, connection))
      return null;

    let account = await ServerEntities.createInstanceEntity
    (
      Account,
      Account.name,   // Prototype name.
      accountName,
      Entity.NameCathegory.ACCOUNT,
      passwordHash
    );

    // 'undefined' means that the name is already taken.
    if (account === undefined)
      return this.reportAccountAlreadyExists(account, email, connection);

    // 'null' means error occured.
    if (account === undefined)
      return this.reportCreationFailure(account, accountName, connection);

    account.email = email;
    account.setPasswordHash(passwordHash);
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
