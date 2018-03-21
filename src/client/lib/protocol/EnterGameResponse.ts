/*
  Part of BrutusNEXT

  Client-side functionality related to enter game request packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {REPORT} from '../../../shared/lib/error/REPORT';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ClientEntities} from '../../../client/lib/entity/ClientEntities';
import {Character} from '../../../client/game/character/Character';
import {Windows} from '../../../client/gui/window/Windows';
import {Connection} from '../../../client/lib/connection/Connection';
import {Move} from '../../../shared/lib/protocol/Move';
import {SharedEnterGameResponse} from
  '../../../shared/lib/protocol/SharedEnterGameResponse';
import {Classes} from '../../../shared/lib/class/Classes';

export class EnterGameResponse extends SharedEnterGameResponse
{
  constructor(result: SharedEnterGameResponse.Result)
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
      REPORT(error, "Failed to enter game");
      ClientApp.switchToState(ClientApp.State.ERROR);
    }
  }

  // --------------- Private methods --------------------

  // ! Throws an exception on error.
  private processResponse(connection: Connection)
  {
    if (this.result.status === "ACCEPTED")
    {
      this.switchToGame(connection, this.result.data);
    }
    else
    {
      Windows.charselectWindow.getForm().displayProblem(this.result.message);
    }
  }

  // ! Throws an exception on error.
  private switchToGame
  (
    connection: Connection,
    data: SharedEnterGameResponse.Data
  )
  {
    let loadLocation = data.serializedLoadLocation.recreateEntity(Entity);
    let character = this.findSelectedCharacter(data.characterMove.entityId);

    connection.createAvatar(character);
    character.enterWorld(data.characterMove);

    ClientApp.switchToState(ClientApp.State.IN_GAME);
  }

  // ! Throws an exception on error.
  private findSelectedCharacter(characterId: string): Character
  {
    return ClientEntities.getEntity(characterId).dynamicCast(Character);
  }

  private reportToPlayer(message: string)
  {
    alert(message);
  }
}

Classes.registerSerializableClass(EnterGameResponse);