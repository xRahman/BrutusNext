/*
  Part of BrutusNEXT

  Server-side functionality related to enter game request packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {REPORT} from '../../../shared/lib/error/REPORT';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {Message} from '../../../server/lib/message/Message';
import {EnterGameRequest as SharedEnterGameRequest} from
  '../../../shared/lib/protocol/EnterGameRequest';
import {EnterGameResponse} from
  '../../../server/lib/protocol/EnterGameResponse';
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
  public async process(connection: Connection): Promise<void>
  {
    let response: EnterGameResponse;

    try
    {
      let account = this.obtainAccount(connection);

      response = await this.enterGame(account);
    }
    catch (error)
    {
      REPORT(error);
      response = this.rejectRequest();
    }

    connection.send(response);

    // let account = this.obtainAccount(connection);
    // let character = this.obtainCharacter(connection);

    // if (!account || !character)
    // {
    //   this.sendErrorResponse(connection);
    //   return;
    // }

    // let characterMove = this.enterWorld(character);
    // let loadLocation = this.obtainLoadLocation(character, connection);

    // if (!characterMove || !loadLocation)
    // {
    //   this.sendErrorResponse(connection);
    //   return;
    // }

    // // Character will be selected when user enters charselect window.
    // account.data.lastActiveCharacter = character;

    // this.acceptRequest(loadLocation, characterMove, connection);
    // this.logSuccess(character, account);
  }

  // --------------- Private methods --------------------

  private async enterGame(account: Account): Promise<EnterGameResponse>
  {
    let character = this.obtainCharacter();
    let characterMove = character.enterWorld();
    let loadLocation = this.obtainLoadLocation(character);

    // Character will be selected when user enters charselect window.
    account.data.lastActiveCharacter = character;

    this.logSuccess(character, account);

    return this.acceptReqest(loadLocation, characterMove);
  }

  private obtainAccount(connection: Connection): Account
  {
    let account = connection.getAccount();

    if (!account || !account.isValid())
    {
      throw new Error("Invalid 'account'");
    }

    return account;
  }

  private obtainCharacter(): Character
  {
    // Character should already be loaded at this time
    // (all characters are loaded when account is loaded)
    // so we just request it from Entities.
    let character = ServerEntities.get(this.characterId);

    if (!character || !character.isValid())
      throw new Error("Invalid 'character'");

    return character.dynamicCast(Character);
  }

  /// To be deleted.
  // private enterWorld(character: Character): Move | null
  // {
  //   let characterMove = character.enterWorld();

  //   if (!characterMove)
  //   {
  //     ERROR("Failed to process enter game request: Invalid 'characterMove'");
  //     return null;
  //   }

  //   return characterMove;
  // }

  private obtainLoadLocation(character: Character): GameEntity
  {
    let loadLocation = character.getLoadLocation();

    if (!loadLocation || !loadLocation.isValid())
      throw new Error("Invalid 'loadLocation'");

    return loadLocation;
  }

  private acceptReqest
  (
    loadLocation: GameEntity,
    characterMove: Move
  )
  : EnterGameResponse
  {
    let response = new EnterGameResponse();

    response.accept(loadLocation, characterMove);
  
    return response;
  }

  private rejectRequest(): EnterGameResponse
  {
    let response = new EnterGameResponse();

    let problem: SharedEnterGameRequest.Problem =
    {
      type: SharedEnterGameRequest.ProblemType.ERROR,
      message: "[ERROR]: Failed to enter game.\n\n"
                + Message.ADMINS_WILL_FIX_IT
    };

    response.addProblem(problem);

    return response;
  }

  /// To be deleted.
  // private sendErrorResponse(connection: Connection)
  // {
  //   let response = new EnterGameResponse();

  //   response.setProblems(problems);
  //   connection.send(response);

  //   const problems: SharedEnterGameRequest.Problems =
  //   {
  //     error: "[ERROR]: Failed to enter game.\n\n" + Message.ADMINS_WILL_FIX_IT
  //   };
    
  //   this.denyRequest(problems, connection);
  // }

  /// To be deleted.
  // private denyRequest
  // (
  //   problems: SharedEnterGameRequest.Problems,
  //   connection: Connection
  // )
  // {
  //   let response = new EnterGameResponse();

  //   response.setProblems(problems);
  //   connection.send(response);
  // }

  /// To be deleted.
  // private acceptRequest
  // (
  //   loadLocation: GameEntity,
  //   characterMove: Move,
  //   connection: Connection
  // )
  // {
  //   let response = new EnterGameResponse();

  //   response.characterMove = characterMove;
  //   response.serializeLoadLocation(loadLocation);

  //   connection.send(response);
  // }

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