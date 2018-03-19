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
      response = this.createErrorResponse();
    }

    connection.send(response);
  }

  // --------------- Private methods --------------------

  private reportAccountCreationFailure
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

  private async accountAlreadyExists
  (
    accountName: string,
    connection: Connection
  )
  : Promise<boolean>
  {
    if (await Accounts.isTaken(accountName))
    {
      this.denyRequest
      (
        "An account is already registered to this e-mail address.",
        RegisterResponse.Result.EMAIL_PROBLEM,
        connection
      );
  
      Syslog.log
      (
        "Attempt to register account " + accountName
          + " from " + connection.getOrigin() + " which"
          + " is already registered",
        MessageType.CONNECTION_INFO,
        AdminLevel.IMMORTAL
      );   
      return true;
    }

    return false;
  }

  // ! Throws an exception on error.
  private async registerAccount
  (
    connection: Connection
  )
  : Promise<RegisterResponse>
  {
    let checkResult = this.checkForProblems(connection);

    if (checkResult !== "NO PROBLEM")
      return this.createProblemsResponse(checkResult);

    return await this.createAccount(connection);
  }

  // ! Throws an exception on error.
  private async createAccount
  (
    connection: Connection
  )
  : Promise<RegisterResponse>
  {
    // Email is used as account name.
    let accountName = this.email;
    // Only hash is stored, not original password.
    let passwordHash = ServerUtils.md5hash(this.password)

    /*
      Kurnik, tohle budu muset celý předělat...
        Teď se existence jména (tzn. name lock souboru) checkuje dvakrát.

      - mělo by to bejt tak, že uvnitř createInstanceEntity() se nejdřív
        checkne, že je jméno volné, pak se vygeneruje idčko a až pak se
        savne name lock file.
          Nemělo by se tedy nejdřív vygenerovat idčko, pak checknout existence
        name locku a pak name lock savnout.


    */

    if (await this.accountAlreadyExists(accountName, connection))
      return false;

    let accountCreationResult = await ServerEntities.createInstanceEntity
    (
      Account,
      // Prototype name.
      Account.name,
      accountName,
      Entity.NameCathegory.ACCOUNT,
      passwordHash
    );

    if (accountCreationResult === "NAME IS ALREADY TAKEN")
    {
      // this.reportAccountCreationFailure(account, accountName, connection);
      // return false;
      return this.createEmailProblemResponse
      (
        "An account is already registered to this e-mail address."
      );
    }

    let account: Account = accountCreationResult;

    this.initAccount(account, passwordHash, connection);
    await ServerEntities.save(account);
    ///this.acceptRequest(account, connection);

    let response = this.createAcceptResponse(loadLocation, characterMove);

    Syslog.log
    (
      "New player: " + account.getUserInfo(),
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    return response;
  }

  private initAccount
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

  /// To be deleted.
  // private acceptRequest(account: Account, connection: Connection)
  // {
  //   let response = new RegisterResponse();
  //   response.result = RegisterResponse.Result.OK;
    
  //   // Add newly created account to the response.
  //   response.serializedAccount.serialize
  //   (
  //     account,
  //     Serializable.Mode.SEND_TO_CLIENT
  //   );

  //   Syslog.log
  //   (
  //     "New player: " + account.getUserInfo(),
  //     MessageType.SYSTEM_INFO,
  //     AdminLevel.IMMORTAL
  //   );
    
  //   connection.send(response);
  // }

  /// To be deleted.
  // private denyRequest
  // (
  //   problem: string,
  //   result: RegisterResponse.Result,
  //   connection: Connection
  // )
  // {
  //   let response = new RegisterResponse();

  //   response.result = result;
  //   response.setProblems(problem);

  //   connection.send(response);
  // }

  /// To be deleted.
  // private isEmailValid(connection: Connection): boolean
  // {
  //   let problem = this.getEmailProblem();

  //   if (!problem)
  //     return true;

  //   this.denyRequest
  //   (
  //     problem,
  //     RegisterResponse.Result.EMAIL_PROBLEM,
  //     connection
  //   );

  //   Syslog.log
  //   (
  //     "Attempt to register invalid e-mail address " + this.email + "."
  //       + " Problem: " + problem,
  //     MessageType.CONNECTION_INFO,
  //     AdminLevel.IMMORTAL
  //   );
    
  //   return false;
  // }

  /// To be deleted.
  // private isPasswordValid(connection: Connection): boolean
  // {
  //   let problem = this.getEmailProblem();

  //   if (!problem)
  //     return true;

  //   this.denyRequest
  //   (
  //     problem,
  //     RegisterResponse.Result.PASSWORD_PROBLEM,
  //     connection
  //   );

  //   Syslog.log
  //   (
  //     "Attempt to register account " + this.email
  //       + " " + connection.getOrigin() + " using"
  //       + " invalid password. Problem: " + problem,
  //     MessageType.CONNECTION_INFO,
  //     AdminLevel.IMMORTAL
  //   );

  //   return false;
  // }

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
  : (Array<RegisterRequest.Problem> | "NO PROBLEM")
  {
    let checkResult: (RegisterRequest.Problem | "NO PROBLEM");
    let problems: Array<RegisterRequest.Problem> = [];

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

  private createEmailProblemResponse(message: string): RegisterResponse
  {
    let problem: RegisterRequest.Problem =
    {
      type: RegisterRequest.ProblemType.EMAIL_PROBLEM,
      message: message
    };

    return this.createProblemsResponse([ problem ]);
  }

  private createProblemsResponse
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

  private createErrorResponse(): RegisterResponse
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
}

// ------------------ Type declarations ----------------------

export module RegisterRequest
{
  // Here we are just reexporting types declared in our ancestor
  // (because they aren't inherited along with the class).
  export type ProblemType = SharedRegisterRequest.ProblemType;
  export type Problem = SharedRegisterRequest.Problem;
}

Classes.registerSerializableClass(RegisterRequest);