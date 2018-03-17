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
      this.enterGame(connection, this.result.data);
    }
    catch (error)
    {
      /// TODO: We have failed to enter the game, we should probably
      /// let the user know and possibly reconnect (or just ask her
      /// to do so).
      REPORT(error, "Failed to enter game");
    }
  }

  // --------------- Private methods --------------------

  // ! Throws an exception on error.
  private enterGame
  (
    connection: Connection,
    data: EnterGameResponse.Data
  )
  {
    let loadLocation = data.serializedLoadLocation.recreateEntity(Entity);

    let character = this.findSelectedCharacter(data.characterMove.entityId);

    connection.createAvatar(character);

    /// TODO: returnovat by asi měla exception.
    if (!character.enterWorld(data.characterMove))
      return;

    ClientApp.switchToState(ClientApp.State.IN_GAME);
  }

  // ! Throws an exception on error.
  private findSelectedCharacter(characterId: string)
  {
    let searchResult = ClientEntities.getEntity(characterId);

    if (searchResult === "NOT FOUND")
    {
      throw new Error
      (
        "Unable to enter game as character with"
        + " id '" + characterId + "' because that"
        + " character is not in client Entities"
      );
    }
    
    let character = searchResult.dynamicCast(Character);

    if (!character.isValid())
    {
      throw new Error
      (
        "Unable to enter game as character with"
        + " id '" + characterId + "' because that"
        + " character is not valid"
      );
    }

    return character;
  }

  /// To be deleted.
  // private deserializeLoadLocation()
  // {
  //   // 'loadLocation' entity is added to ClientEntities here as
  //   // side effect. It can later be accessed using it's id.
  //   let loadLocation = this.serializedLoadLocation.restore(Entity);
    
  //   if (!loadLocation || !loadLocation.isValid())
  //   {
  //     ERROR("Invalid load location in charselect response");
  //     return false;
  //   }

  //   return true;
  // }
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