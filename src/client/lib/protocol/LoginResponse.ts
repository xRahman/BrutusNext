/*
  Part of BrutusNEXT

  Client-side functionality related to login response packet.
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
import {Character} from '../../../client/game/character/Character';
import {Account} from '../../../client/lib/account/Account';
import {Windows} from '../../../client/gui/window/Windows';
import {Connection} from '../../../client/lib/connection/Connection';
import {LoginResponse as SharedLoginResponse} from
  '../../../shared/lib/protocol/LoginResponse';
import {Classes} from '../../../shared/lib/class/Classes';

export class LoginResponse extends SharedLoginResponse
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ---------------- Public methods --------------------

  public process(connection: Connection)
  {
    Windows.loginWindow.form.onResponse();
    
    if (this.result === LoginResponse.Result.UNDEFINED)
    {
      this.reportInvalidResponse('login');
      return;
    }

    if (this.result === LoginResponse.Result.OK)
    {
      this.acceptResponse(connection);
      return;
    }

    // Otherwise display to the user what the problem is.
    Windows.loginWindow.form.displayProblem(this);
  }

  // --------------- Private methods --------------------

  private acceptResponse(connection: Connection)
  {
    this.extractData(connection);
    Windows.loginWindow.form.rememberCredentials();
    ClientApp.setState(ClientApp.State.CHARSELECT);
  }

  private extractData(connection: Connection)
  {
    let account = this.account.deserializeEntity(Account);
    
    // Also deserialize characters on the account. We will
    // need them to populate character select window.
    for (let characterData of this.characters)
    {
      let character: Character = characterData.deserializeEntity(Character);

      account.data.updateCharacterReference(character);
    }

    connection.setAccount(account);
  }
}

// This overwrites ancestor class.
Classes.registerSerializableClass(LoginResponse);