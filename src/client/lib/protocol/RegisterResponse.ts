/*
  Part of BrutusNEXT

  Client-side functionality related to register request packet.
*/

/*
  Note:
    This class needs to use the same name as it's ancestor in /shared,
  because class name of the /shared version of the class is written to
  serialized data on the server and is used to create /client version
  of the class when deserializing the packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Account} from '../../../client/lib/account/Account';
import {Windows} from '../../../client/gui/window/Windows';
import {Connection} from '../../../client/lib/connection/Connection';
import {RegisterResponse as SharedRegisterResponse} from
  '../../../shared/lib/protocol/RegisterResponse';
import {Classes} from '../../../shared/lib/class/Classes';

export class RegisterResponse extends SharedRegisterResponse
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ---------------- Public methods --------------------

  public process(connection: Connection)
  {
    Windows.registerWindow.form.onResponse();
    
    if (this.result === RegisterResponse.Result.UNDEFINED)
    {
      this.reportInvalidResponse('register');
      return;
    }

    if (this.result === RegisterResponse.Result.OK)
    {
      this.acceptResponse(connection);
      return;
    }

    // Otherwise display to the user what the problem is.
    Windows.registerWindow.form.displayProblem(this);
  }

  // --------------- Private methods --------------------
  
  private acceptResponse(connection: Connection)
  {
    if (!this.deserializeAccount(connection))
      return;

    Windows.registerWindow.form.rememberCredentials();
    ClientApp.setState(ClientApp.State.CHARSELECT);
  }

  private deserializeAccount(connection: Connection)
  {
    let account = this.account.deserializeEntity(Account);

    if (!Entity.isValid(account))
    {
      ERROR("Invalid account in register response");
      return false;
    }

    connection.setAccount(account);

    return true;
  }
}

// This overwrites ancestor class.
Classes.registerSerializableClass(RegisterResponse);