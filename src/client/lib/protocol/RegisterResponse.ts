/*
  Part of BrutusNEXT

  Client-side functionality related to register response packet.
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

  // ~ Overrides Packet.process().
  public async process(connection: Connection)
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
    ClientApp.switchToState(ClientApp.State.CHARSELECT);
  }

  private deserializeAccount(connection: Connection)
  {
    let account = this.serializedAccount.restore(Account);

    if (!account || !account.isValid())
    {
      ERROR("Invalid account in register response");
      return false;
    }

    connection.setAccount(account);

    return true;
  }
}

Classes.registerSerializableClass(RegisterResponse);