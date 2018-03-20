/*
  Part of BrutusNEXT

  Client-side functionality related to register response packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {REPORT} from '../../../shared/lib/error/REPORT';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Account} from '../../../client/lib/account/Account';
import {Windows} from '../../../client/gui/window/Windows';
import {Connection} from '../../../client/lib/connection/Connection';
import {SerializedEntity} from '../../../shared/lib/protocol/SerializedEntity';
import {RegisterResponse as SharedRegisterResponse} from
  '../../../shared/lib/protocol/RegisterResponse';
import {Classes} from '../../../shared/lib/class/Classes';

export class RegisterResponse extends SharedRegisterResponse
{
  constructor(result: RegisterResponse.Result)
  {
    super(result);

    this.version = 0;
  }

  // ---------------- Public methods --------------------

  // ~ Overrides Packet.process().
  public async process(connection: Connection): Promise<void>
  {
    try
    {
      this.processResponse(connection);
    }
    catch (error)
    {
      REPORT(error, "Failed to enter charselect");
      ClientApp.switchToState(ClientApp.State.ERROR);
    }
  }

  // --------------- Private methods --------------------

  // ! Throws an exception on error.
  private processResponse(connection: Connection)
  {
    Windows.registerWindow.getForm().onResponse();

    if (this.result.status === "ACCEPTED")
    {
      this.switchToCharselect(connection, this.result.data);
    }
    else
    {
      Windows.registerWindow.getForm().displayProblems(this.result.problems);
    }
  }

  // ! Throws an exception on error.
  private switchToCharselect
  (
    connection: Connection,
    data: RegisterResponse.Data
  )
  {
    let account = this.deserializeAccount(data.serializedAccount);

    connection.setAccount(account);

    Windows.registerWindow.getForm().rememberCredentials();
    ClientApp.switchToState(ClientApp.State.CHARSELECT);
  }

  // ! Throws an exception on error.
  private deserializeAccount(serializedAccount: SerializedEntity): Account
  {
    let account = serializedAccount.recreateEntity(Account);

    if (!account || !account.isValid())
      throw new Error("Invalid account in register response");

    return account;
  }
}

// ------------------ Type declarations ----------------------

export module RegisterResponse
{
  // Here we are just reexporting types declared in our ancestor
  // (because they aren't inherited along with the class).
  export type Data = SharedRegisterResponse.Data;
  export type Result = SharedRegisterResponse.Result;
}

Classes.registerSerializableClass(RegisterResponse);