/*
  Part of BrutusNEXT

  Registration of a new player account.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Message} from '../../../server/lib/message/Message';
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
    if (!this.isOk(request, connection))
      return;

    // Encode email address so it can be used as file name
    // (this usualy does nothing because characters that are
    //  not allowed in email addresss are rarely used in e-mail
    //  address - but better be sure).
    let accountName = Utils.encodeEmail(request.email);
    let password = request.password;
    let account: Account = null;

    account = await Accounts.register(accountName, password, connection);

    // 'undefined' means that the name is already taken.
    if (account === undefined)
    {
      this.denyRequest
      (
        "An account is already registered to this e-mail address.",
        RegisterResponse.Result.EMAIL_PROBLEM,
        connection
      );
      return;
    }

    if (account === null)
    {
      console.log('denying request');
      this.denyRequest
      (
        "[ERROR]: Failed to create account.\n\n"
          + Message.ADMINS_WILL_FIX_IT,
        RegisterResponse.Result.FAILED_TO_CREATE_ACCOUNT,
        connection
      );
      return;
    }

    this.acceptRequest(account, connection);
  }

  // ------------- Private static methods ---------------

  private static acceptRequest(account: Account, connection: Connection)
  {
    let response = new RegisterResponse();
    response.result = RegisterResponse.Result.OK;
    
    // Add newly create account to the response.
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

  private static isOk(request: RegisterRequest, connection: Connection): boolean
  {
    let problem = null;

    if (problem = request.getEmailProblem())
    {
      this.denyRequest
      (
        problem,
        RegisterResponse.Result.EMAIL_PROBLEM,
        connection
      );
      return false;
    }

    if (problem = request.getPasswordProblem())
    {
      this.denyRequest
      (
        problem,
        RegisterResponse.Result.PASSWORD_PROBLEM,
        connection
      );
      return false;
    }

    return true;
  }

  // ---------------- Public methods --------------------

  // --------------- Private methods --------------------
}
