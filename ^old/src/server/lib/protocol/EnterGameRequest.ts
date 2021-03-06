/*
  Part of BrutusNEXT

  Server-side functionality related to enter game request packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {REPORT} from '../../../shared/lib/error/REPORT';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {Message} from '../../../server/lib/message/Message';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {SerializedEntity} from '../../../shared/lib/protocol/SerializedEntity';
import {EnterGameRequest as SharedEnterGameRequest} from
  '../../../shared/lib/protocol/EnterGameRequest';
import {EnterGameResponse} from
  '../../../server/lib/protocol/EnterGameResponse';
import {Account} from '../../../server/lib/account/Account';
import {Character} from '../../../server/game/character/Character';
import {Characters} from '../../../server/game/character/Characters';
import {GameEntity} from '../../../server/game/GameEntity';
import {Connection} from '../../../server/lib/connection/Connection';
import {Move} from '../../../shared/lib/protocol/Move';
import {Classes} from '../../../shared/lib/class/Classes';

export class EnterGameRequest extends SharedEnterGameRequest
{
  constructor(characterId: string)
  {
    super(characterId);

    this.version = 0;
  }

  // ---------------- Public methods --------------------

  // ~ Overrides Packet.process().
  // -> Returns 'true' on success.
  public async process(connection: Connection): Promise<void>
  {
    let response: EnterGameResponse;

    try
    {
      response = await this.enterGame(connection);
    }
    catch (error)
    {
      REPORT(error);
      response = this.errorResponse();
    }

    connection.send(response);
  }

  // --------------- Private methods --------------------

  // ! Throws an exception on error.
  private async enterGame
  (
    connection: Connection
  )
  : Promise<EnterGameResponse>
  {
    let character = Characters.getCharacter(this.characterId);
    let account = connection.getAccount();

    // Character will be selected when user enters charselect window.
    this.setLastActiveCharacter(account, character);

    let characterMove = character.enterWorld();
    let loadLocation = character.getLoadLocation();

    this.logSuccess(account, character);

    return this.successResponse(loadLocation, characterMove);
  }

  private logSuccess(account: Account, character: Character)
  {
    Syslog.logSystemInfo
    (
      "Player " + account.getEmail() + " has entered"
        + " game as " + character.getName()
    );
  }

  private setLastActiveCharacter(account: Account, character: Character)
  {
    account.data.lastActiveCharacter = character;
  }

  // ! Throws an exception on error.
  private successResponse
  (
    loadLocation: GameEntity,
    characterMove: Move
  )
  : EnterGameResponse
  {
    let serializedLoadLocation = this.serializeEntity(loadLocation);

    let result: EnterGameResponse.Result =
    {
      status: "ACCEPTED",
      data:
      {
        characterMove,
        serializedLoadLocation
      }
    };

    return new EnterGameResponse(result);
  }

  private errorResponse(): EnterGameResponse
  {
    let result: EnterGameResponse.Result =
    {
      status: "REJECTED",
      message: "An error occured preventing you from entering game.\n\n"
                + Message.ADMINS_WILL_FIX_IT
    };

    return new EnterGameResponse(result);
  }
}

Classes.registerSerializableClass(EnterGameRequest);