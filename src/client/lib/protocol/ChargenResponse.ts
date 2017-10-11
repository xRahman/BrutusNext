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
import {ClientEntities} from '../../../client/lib/entity/ClientEntities';
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

  // ~ Overrides Packet.process().
  public async process(connection: Connection)
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

    if (!character)
      return;

    ClientApp.setState(ClientApp.State.CHARSELECT);

    // Select newly added character
    // (we can do it here because ClientApp.setState() called
    //  charselectForm.onShow() which created the charplate).
    Windows.charselectWindow.form.selectCharacter(character.getId());
  }

  // -> Returns 'null' on failure.
  private extractData(connection: Connection)
  {
    // This should overwrite existing account
    // (we don't need to update connection.account because
    //  player had to log in before creating a character
    //  so that reference is already set).
    let account = this.serializedAccount.restore(Account);

    if (connection.getAccount().getId() !== account.getId())
    {
      ERROR("Account (" + account.getErrorIdString() + ")"
        + " contained in chargen response packet is"
        + " not the one the player logged in with"
        + " (" + connection.getAccount().getErrorIdString() + ")."
        + " Account is not updated and response isn't accepted");

      // There is probably no point in trying to recover from this
      // error so this is just for for the sake of trying.
      ClientEntities.release(account);
      return null;
    }

    let character = this.serializedCharacter.restore(Character);

    account.data.updateCharacterReference(character);

    return character;
  }
}

// This overwrites ancestor class.
Classes.registerSerializableClass(ChargenResponse);