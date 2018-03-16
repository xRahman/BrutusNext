/*
  Part of BrutusNEXT

  Client-side functionality related to enter game request packet.
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
import {ClientEntities} from '../../../client/lib/entity/ClientEntities';
import {Character} from '../../../client/game/character/Character';
import {Windows} from '../../../client/gui/window/Windows';
import {Connection} from '../../../client/lib/connection/Connection';
import {EnterGameResponse as SharedEnterGameResponse} from
  '../../../shared/lib/protocol/EnterGameResponse';
import {Classes} from '../../../shared/lib/class/Classes';

export class EnterGameResponse extends SharedEnterGameResponse
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
    if (this.result === EnterGameResponse.Result.UNDEFINED)
    {
      this.reportInvalidResponse('charselect');
      return;
    }

    if (this.result === EnterGameResponse.Result.OK)
    {
      this.acceptResponse(connection);
      return;
    }

    // Otherwise display to the user what the problem is.
    Windows.charselectWindow.form.displayProblem(this);
  }

  // --------------- Private methods --------------------

  private acceptResponse(connection: Connection)
  {
    let character = this.getSelectedCharacter();
    
    if (!character)
      return;

    connection.createAvatar(character);

    // Note: This must be done before character.enterWorld(),
    // otherwise the room (or other entity the character loads
    // into) might not exist on the client.
    if (!this.deserializeLoadLocation())
      return;

    if (!character.enterWorld(this.characterMove))
      return;

    ClientApp.setState(ClientApp.State.IN_GAME);
  }

  private getSelectedCharacter()
  {
    let characterId = this.characterMove.entityId;

    let character: Character =
      ClientEntities.get(characterId).dynamicCast(Character);

    if (!character || !character.isValid())
    {
      ERROR("Invalid selected character (id: " + characterId + ")");
      return null;
    }

    return character;
  }

  private deserializeLoadLocation()
  {
    // 'loadLocation' entity is added to ClientEntities here as
    // side effect. It can later be accessed using it's id.
    let loadLocation = this.serializedLoadLocation.restore(Entity);
    
    if (!loadLocation || !loadLocation.isValid())
    {
      ERROR("Invalid load location in charselect response");
      return false;
    }

    return true;
  }
}

Classes.registerSerializableClass(EnterGameResponse);