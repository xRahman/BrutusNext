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
import {EnterGameResponse as SharedEnterGameResponse} from
  '../../../shared/lib/protocol/EnterGameResponse';
import {Classes} from '../../../shared/lib/class/Classes';

export class EnterGameResponse extends SharedEnterGameResponse
{
  constructor(result: EnterGameResponse.Result)
  {
    super(result);

    this.version = 0;
  }

  // ---------------- Public methods --------------------

  // ~ Overrides Packet.process().
  public async process(connection: Connection): Promise<void>
  {
    if (this.result.status === "REJECTED")
    {
      Windows.charselectWindow.getForm().displayProblem(this.result.message);
      return;
    }

    try
    {
      this.switchToGame(connection, this.result.data);
    }
    catch (error)
    {
      REPORT(error, "Failed to enter game");
      ClientApp.switchToState(ClientApp.State.ERROR);
    }
  }

  // --------------- Private methods --------------------

  // ! Throws an exception on error.
  private switchToGame
  (
    connection: Connection,
    data: EnterGameResponse.Data
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

// ------------------ Type declarations ----------------------

export module EnterGameResponse
{
  // Here we are just reexporting types declared in our ancestor
  // (because they aren't inherited along with the class).
  export type Data = SharedEnterGameResponse.Data;
  export type Result = SharedEnterGameResponse.Result;
}

Classes.registerSerializableClass(EnterGameResponse);