/*
  Part of BrutusNEXT

  Entering game with selected character.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {Account} from '../../../server/lib/account/Account';
import {Character} from '../../../server/game/character/Character';
import {Entity} from '../../../shared/lib/entity/Entity';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Connection} from '../../../server/lib/connection/Connection';
import {CharselectRequest} from
  '../../../shared/lib/protocol/CharselectRequest';
import {CharselectResponse}
  from '../../../shared/lib/protocol/CharselectResponse';
import {EntityMove} from '../../../shared/lib/protocol/EntityMove';

export class Charselect
{
  // ------------- Public static methods ----------------

  public static async processRequest
  (
    request: CharselectRequest,
    connection: Connection
  )
  {
    if (!this.isConnectionValid(connection))
      return;

    let account = this.getAccountFromConnection(connection);
    let character = this.getRequestedCharacter(request, connection);

    if (!character || !account)
      return;

    // Character will be selected when user enters charselect window.
    account.data.lastActiveCharacter = character;
    
    let move = character.enterWorld();

    this.acceptRequest(connection, account, character, move);
  }

  // ------------- Private static methods ---------------

  private static isConnectionValid(connection: Connection)
  {
    if (!connection)
    {
      ERROR("Invalid connection. Charselect request is not processed");

      this.sendErrorResponse
      (
        "[ERROR]: Invalid connection.",
        connection
      );

      return false;
    }

    return true;
  }

  private static getAccountFromConnection(connection: Connection)
  {
    let account = connection.account;

    if (account === null)
    {
      ERROR("Charselect request is triggered on connection that has"
        + " no account attached to it. Request is not processed");
      return null;
    }

    if (!Entity.isValid(account))
    {
      ERROR("Invalid account on connection. Charselect request is not"
        + " processed");
      return null;
    }

    return account;
  }

  private static getRequestedCharacterId
  (
    request: CharselectRequest,
    connection: Connection
  )
  {
    let id = request.characterId;
    
    if (!id)
    {
      ERROR("Invalid character id in charselect request."
        + " Request is not processed");

      this.sendErrorResponse
      (
        "[ERROR]: Invalid character id.",
        connection
      );

      return null;
    }

    return id;
  }

  private static getRequestedCharacter
  (
    request: CharselectRequest,
    connection: Connection
  )
  {
    let id = this.getRequestedCharacterId(request, connection);

    if (!id)
      return;

    // Character should already be loaded at this time
    // (all characters are loaded when account is loaded)
    // so we just request it from Entities.
    let character = ServerEntities.get(id);

    if (!character)
    {
      ERROR("Invalid character requested by id " + id + "."
        + " Request is not processed");

      this.sendErrorResponse
      (
        "[ERROR]: Invalid character.",
        connection
      );

      return null;
    }
    
    return character.dynamicCast(Character);
  }

  private static sendErrorResponse
  (
    problem: string,
    connection: Connection
  )
  {
    this.denyRequest
    (
      problem,
      CharselectResponse.Result.ERROR,
      connection
    );
  }

  private static denyRequest
  (
    problem: string,
    result: CharselectResponse.Result,
    connection: Connection
  )
  {
    let response = new CharselectResponse();
    
    response.result = result;
    response.setProblem(problem);

    connection.send(response);
  }

  private static createResponse
  (
    account: Account,
    character: Character,
    move: EntityMove
  )
  {
    let response = new CharselectResponse();

    response.result = CharselectResponse.Result.OK;
    response.characterMove = move;
    response.setLoadLocation(character.getLoadLocation());

    return response;
  }

  private static acceptRequest
  (
    connection: Connection,
    account: Account,
    character: Character,
    move: EntityMove
  )
  {
    let response = this.createResponse(account, character, move);

    Syslog.log
    (
      account.getUserInfo() + " has entered"
        + " game as " + character.getName(),
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );
    
    connection.send(response);
  }
}
