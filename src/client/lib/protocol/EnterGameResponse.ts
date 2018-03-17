/*
  Part of BrutusNEXT

  Client-side functionality related to enter game request packet.
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

    this.enterGame
    (
      connection,
      this.result.characterMove,
      /// TODO: Tohle bych asi mohl predat rovnou deserializovane
      /// (casem se to bude beztak deserializovat rovnou s packetem)
      this.result.serializedLoadLocation
    );
  }

  // --------------- Private methods --------------------

  private enterGame
  (
    connection: Connection,
    characterMove: Move,
    loadLocation: Entity
  )
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

    if (!character.enterWorld(characterMove))
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

// ------------------ Type declarations ----------------------

export module EnterGameResponse
{
  // Here we are just reexporting the same declared in our ancestor
  // (because types declared in module aren't inherited along with the class).
  export type Result = SharedEnterGameResponse.Result;
}

Classes.registerSerializableClass(EnterGameResponse);