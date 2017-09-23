/*
  Part of BrutusNEXT

  Client-side functionality related to character creation request packet.
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
import {Account} from '../../../client/lib/account/Account';
import {Character} from '../../../client/game/character/Character';
import {Windows} from '../../../client/gui/window/Windows';
import {Connection} from '../../../client/lib/connection/Connection';
import {ChargenResponse as SharedChargenResponse} from
  '../../../shared/lib/protocol/ChargenResponse';
import {Classes} from '../../../shared/lib/class/Classes';

export class ChargenResponse extends SharedChargenResponse
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ---------------- Public methods --------------------

  public process(connection: Connection)
  {
    Windows.chargenWindow.form.onResponse();
    
    if (this.result === ChargenResponse.Result.UNDEFINED)
    {
      this.reportInvalidResponse('chargen');
      return;
    }

    if (this.result === ChargenResponse.Result.OK)
    {
      this.acceptResponse(connection);
      return;
    }

    // Otherwise display to the user what the problem is.
    Windows.chargenWindow.form.displayProblem(this);
  }

  // --------------- Private methods --------------------
  
  private acceptResponse(connection: Connection)
  {
    let character = this.extractData(connection);

    ClientApp.setState(ClientApp.State.CHARSELECT);

    // Select newly added character
    // (we can do it here because ClientApp.setState() called
    //  charselectForm.onShow() which created the charplate).
    Windows.charselectWindow.form.selectCharacter(character.getId());
  }

  private extractData(connection: Connection)
  {
    let account = this.account.deserializeEntity(Account);
    let character = this.character.deserializeEntity(Character);

    account.data.updateCharacterReference(character);
    connection.setAccount(account);

    return character;
  }
}

// This overwrites ancestor class.
Classes.registerSerializableClass(ChargenResponse);