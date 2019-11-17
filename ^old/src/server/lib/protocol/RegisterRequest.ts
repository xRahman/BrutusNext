/*
  Part of BrutusNEXT

  Server-side functionality related to account creation request packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {REPORT} from '../../../shared/lib/error/REPORT';
import {RegisterRequest as SharedRegisterRequest} from
  '../../../shared/lib/protocol/RegisterRequest';
import {Utils} from '../../../shared/lib/utils/Utils';
import {ServerUtils} from '../../../server/lib/utils/ServerUtils';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {SerializedEntity} from '../../../shared/lib/protocol/SerializedEntity';
import {Account} from '../../../server/lib/account/Account';
import {Accounts} from '../../../server/lib/account/Accounts';
import {Connection} from '../../../server/lib/connection/Connection';
import {RegisterResponse} from '../../../server/lib/protocol/RegisterResponse';
import {Classes} from '../../../shared/lib/class/Classes';

export class RegisterRequest extends SharedRegisterRequest
{
  constructor(email: string, password: string)
  {
    super(email, password);

    this.version = 0;
  }

  // ---------------- Public methods --------------------

  // ~ Overrides Packet.process().
  public async process(connection: Connection): Promise<void>
  {
    let response: RegisterResponse;

    try
    {
      response = await this.registerAccount(connection);
    }
    catch (error)
    {
      REPORT(error);
      response = this.errorResponse();
    }

    connection.send(response);
  }

  // --------------- Private methods --------------------

  // ! Throws an exception on error.
  private async registerAccount
  (
    connection: Connection
  )
  : Promise<RegisterResponse>
  {
    let checkResult = this.checkForProblems(connection);

    if (checkResult !== "NO PROBLEM")
      return this.problemsResponse(checkResult);

    // Email is used as account name.
    let accountName = this.email;
    // Only hash is stored, not original password.
    let passwordHash = ServerUtils.md5hash(this.password)

    let createResult = await this.createAccount(accountName, passwordHash);

    if (createResult === "NAME IS ALREADY TAKEN")
    {
      this.logAccountAlreadyExists(accountName, connection);
      return this.accountAlreadyExistsResponse();
    }

    let account: Account = createResult;

    account.attachConnection(connection);

    this.logSuccess(account);

    return this.successResponse(account);
  }

  // ! Throws an exception on error.
  private async createAccount
  (
    accountName: string,
    passwordHash: string
  )
  : Promise<Account | "NAME IS ALREADY TAKEN">
  {
    let createResult = await ServerEntities.createInstanceEntity
    (
      Account,
      // Prototype name.
      Account.name,
      accountName,
      Entity.NameCathegory.ACCOUNT,
      passwordHash
    );

    if (createResult === "NAME IS ALREADY TAKEN")
      return "NAME IS ALREADY TAKEN";

    let account: Account = createResult;

    account.setPasswordHash(passwordHash);
    account.addToLists();

    await ServerEntities.save(account);

    return account;
  }

  private logEmailProblem(message: string)
  {
    Syslog.log
    (
      "Attempt to register invalid e-mail address " + this.email + "."
        + " Problem: " + message,
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
  }

  private logPasswordProblem(message: string, connection: Connection)
  {
    Syslog.log
    (
      "Attempt to register account " + this.email
        + " " + connection.getOrigin() + " using"
        + " invalid password. Problem: " + message,
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
  }

  private checkForProblems
  (
    connection: Connection
  )
  : Array<RegisterRequest.Problem> | "NO PROBLEM"
  {
    let problems: Array<RegisterRequest.Problem> = [];
    let checkResult: (RegisterRequest.Problem | "NO PROBLEM");

    if ((checkResult = this.checkEmail()) !== "NO PROBLEM")
    {
      this.logEmailProblem(checkResult.message);
      problems.push(checkResult);
    }

    if ((checkResult = this.checkPassword()) !== "NO PROBLEM")
    {
      this.logPasswordProblem(checkResult.message, connection)
      problems.push(checkResult);
    }

    if (problems.length === 0)
      return "NO PROBLEM";
    else
      return problems;
  }

  private logAccountAlreadyExists(accountName: string, connection: Connection)
  {
    Syslog.logConnectionInfo
    (
      "Attempt to register account " + accountName
        + " from " + connection.getOrigin() + " which"
        + " is already registered"
    );
  }

  private logSuccess(account: Account)
  {
    Syslog.log
    (
      "New player: " + account.getUserInfo(),
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );
  }

  private accountAlreadyExistsResponse(): RegisterResponse
  {
    let problem: RegisterRequest.Problem =
    {
      type: RegisterRequest.ProblemType.EMAIL_PROBLEM,
      message: "An account is already registered to this e-mail address."
    };

    return this.problemsResponse([ problem ]);
  }

  private problemsResponse
  (
    problems: Array<RegisterRequest.Problem>
  )
  : RegisterResponse
  {
    let result: RegisterResponse.Result =
    {
      status: "REJECTED",
      problems: problems
    };

    return new RegisterResponse(result);
  }

  private errorResponse(): RegisterResponse
  {
    let problem: RegisterRequest.Problem =
    {
      type: RegisterRequest.ProblemType.ERROR,
      message: "An error occured while creating your account.\n\n"
                + Message.ADMINS_WILL_FIX_IT
    };

    let result: RegisterResponse.Result =
    {
      status: "REJECTED",
      problems: [ problem ]
    };

    return new RegisterResponse(result);
  }

  // ! Throws an exception on error.
  private successResponse(account: Account): RegisterResponse
  {
    let serializedAccount = this.serializeEntity(account);

    let result: RegisterResponse.Result =
    {
      status: "ACCEPTED",
      data: { serializedAccount }
    };

    return new RegisterResponse(result);
  }
}

// ------------------ Type declarations ----------------------

export module RegisterRequest
{
  // Reexport ancestor types becuase they are not inherited automatically.
  export type Problem = SharedRegisterRequest.Problem;
}

Classes.registerSerializableClass(RegisterRequest);