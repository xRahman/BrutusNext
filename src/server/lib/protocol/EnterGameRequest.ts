/*
  Part of BrutusNEXT

  Server-side functionality related to enter game request packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {Message} from '../../../server/lib/message/Message';
import {EnterGameRequest as SharedEnterGameRequest} from
  '../../../shared/lib/protocol/EnterGameRequest';
import {EnterGameResponse} from
  '../../../shared/lib/protocol/EnterGameResponse';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {Account} from '../../../server/lib/account/Account';
import {Character} from '../../../server/game/character/Character';
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
  public async process(connection: Connection): Promise<boolean>
  {
    let account = this.obtainAccount(connection);
    let character = this.obtainCharacter(connection);

    if (!account || !character)
    {
      this.sendErrorResponse(connection);
      return false;
    }

    let characterMove = this.enterWorld(character);
    let loadLocation = this.obtainLoadLocation(character, connection);

    if (!characterMove || !loadLocation)
    {
      this.sendErrorResponse(connection);
      return false;
    }

    // Character will be selected when user enters charselect window.
    account.data.lastActiveCharacter = character;

    this.acceptRequest(loadLocation, characterMove, connection);
    this.logSuccess(character, account);

    return true;
  }

  // --------------- Private methods --------------------

  private obtainAccount(connection: Connection): Account | null
  {
    let account = connection.getAccount();

    if (!account || !account.isValid())
    {
      ERROR("Failed to process enter game request: Invalid account");
      return null;
    }

    return account;
  }

  private obtainCharacter(connection: Connection): Character | null
  {
    // Character should already be loaded at this time
    // (all characters are loaded when account is loaded)
    // so we just request it from Entities.
    let character = ServerEntities.get(this.characterId);

    if (!character || !character.isValid())
    {
      ERROR("Failed to process enter game request: Invalid 'character'");
      return null;
    }

    return character.dynamicCast(Character);
  }

  private enterWorld(character: Character): Move | null
  {
    let characterMove = character.enterWorld();

    if (!characterMove)
    {
      ERROR("Failed to process enter game request: Invalid 'characterMove'");
      return null;
    }

    return characterMove;
  }

  private obtainLoadLocation
  (
    character: Character | null,
    connection: Connection
  )
  : GameEntity | null
  {
    if (!character)
      return null;

    let loadLocation = character.getLoadLocation();

    if (!loadLocation || !loadLocation.isValid())
    {
      ERROR("Failed to process enter game request: Invalid 'loadLocation'");
      return null;
    }

    return loadLocation;
  }

  private sendErrorResponse(connection: Connection)
  {
    const problems: SharedEnterGameRequest.Problems =
    {
      error: "[ERROR]: Failed to enter game.\n\n" + Message.ADMINS_WILL_FIX_IT
    };
    
    this.denyRequest(problems, connection);
  }

  private denyRequest
  (
    problems: SharedEnterGameRequest.Problems,
    connection: Connection
  )
  {
    let response = new EnterGameResponse();

    response.setProblems(problems);
    connection.send(response);
  }

  private acceptRequest
  (
    loadLocation: GameEntity,
    characterMove: Move,
    connection: Connection
  )
  {
    let response = new EnterGameResponse();

    response.characterMove = characterMove;
    response.serializeLoadLocation(loadLocation);

    connection.send(response);
  }

  private logSuccess(character: Character, account: Account)
  {
    Syslog.logSystemInfo
    (
      "Player " + account.getEmail() + " has entered"
        + " game as " + character.getName()
    );
  }
}

Classes.registerSerializableClass(EnterGameRequest);