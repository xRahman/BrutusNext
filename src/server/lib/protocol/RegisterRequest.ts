/*
  Part of BrutusNEXT

  Server-side functionality related to account creation request packet.
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
import {RegisterResponse} from '../../../shared/lib/protocol/RegisterResponse';
import {Classes} from '../../../shared/lib/class/Classes';

export class RegisterRequest extends SharedRegisterRequest
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
    if (!this.isRequestValid(connection))
      return;

    await this.createAccount
    (
      // Email is used as account name.
      this.email,
      // Only hash is stored, not original password.
      ServerUtils.md5hash(this.password),
      connection
    );
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

  private async createAccount
  (
    accountName: string,
    passwordHash: string,
    connection: Connection
  )
  {
    if (await this.accountAlreadyExists(accountName, connection))
      return;

    let account = await ServerEntities.createInstanceEntity
    (
      Account,
      Account.name,   // Prototype name.
      accountName,
      Entity.NameCathegory.ACCOUNT,
      passwordHash
    );

    if (account === null)
    {
      this.reportAccountCreationFailure(account, accountName, connection);
      return;
    }

    this.initAccount(account, passwordHash, connection);
    await ServerEntities.save(account);
    this.acceptRequest(account, connection);
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

  private acceptRequest(account: Account, connection: Connection)
  {
    let response = new RegisterResponse();
    response.result = RegisterResponse.Result.OK;
    
    // Add newly created account to the response.
    response.serializedAccount.store
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

  private denyRequest
  (
    problem: string,
    result: RegisterResponse.Result,
    connection: Connection
  )
  {
    let response = new RegisterResponse();

    response.result = result;
    response.setProblems(problem);

    connection.send(response);
  }

  private isEmailValid(connection: Connection): boolean
  {
    let problem = this.getEmailProblem();

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
      "Attempt to register invalid e-mail address " + this.email + "."
        + " Problem: " + problem,
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
    
    return false;
  }

  private isPasswordValid(connection: Connection): boolean
  {
    let problem = this.getEmailProblem();

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
      "Attempt to register account " + this.email
        + " " + connection.getOrigin() + " using"
        + " invalid password. Problem: " + problem,
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );

    return false;
  }

  private isRequestValid(connection: Connection): boolean
  {
    if (!this.isEmailValid(connection))
      return false;

    if (!this.isPasswordValid(connection))
      return false;

    return true;
  }
}

// This overwrites ancestor class.
Classes.registerSerializableClass(RegisterRequest);