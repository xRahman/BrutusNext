/*
  Part of BrutusNEXT

  Client-side functionality related to login response packet.
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

  // ~ Overrides Packet.process().
  public async process(connection: Connection)
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
    let account = this.serializedAccount.restore(Account);
    
    // Also deserialize characters on the account. We will
    // need them to populate character select window.
    for (let serializedCharacter of this.serializedCharacters)
    {
      let character: Character = serializedCharacter.restore(Character);

      account.data.updateCharacterReference(character);
    }

    connection.setAccount(account);
  }
}

Classes.registerSerializableClass(LoginResponse);