/*
  Part of BrutusNEXT

  Server-side functionality related to character selection request packet.
*/

/*
  Note:
    This class needs to use the same name as it's ancestor in /shared,
  because class name of the /shared version of the class is written to
  serialized data on the client and is used to create /server version
  of the class when deserializing the packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {EnterGameRequest as SharedEnterGameRequest} from
  '../../../shared/lib/protocol/EnterGameRequest';
import {EnterGameResponse} from
  '../../../shared/lib/protocol/EnterGameResponse';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {Account} from '../../../server/lib/account/Account';
import {Character} from '../../../server/game/character/Character';
import {Entity} from '../../../shared/lib/entity/Entity';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Connection} from '../../../server/lib/connection/Connection';
import {Move} from '../../../shared/lib/protocol/Move';
import {Classes} from '../../../shared/lib/class/Classes';

export class EnterGameRequest extends SharedEnterGameRequest
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
    let account = this.getAccountFromConnection(connection);
    let character = this.getRequestedCharacter(connection);

    if (!character || !account)
      return;

    // Character will be selected when user enters charselect window.
    account.data.lastActiveCharacter = character;
    
    let move = character.enterWorld();

    this.acceptRequest(connection, account, character, move);
  }

  // --------------- Private methods --------------------

  private isConnectionValid(connection: Connection)
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

  private getAccountFromConnection(connection: Connection)
  {
    if (!this.isConnectionValid(connection))
      return null;

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

  private getRequestedCharacterId(connection: Connection)
  {
    let id = this.characterId;
    
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

  private getRequestedCharacter(connection: Connection)
  {
    let id = this.getRequestedCharacterId(connection);

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

  private sendErrorResponse
  (
    problem: string,
    connection: Connection
  )
  {
    this.denyRequest
    (
      problem,
      EnterGameResponse.Result.ERROR,
      connection
    );
  }

  private denyRequest
  (
    problem: string,
    result: EnterGameResponse.Result,
    connection: Connection
  )
  {
    let response = new EnterGameResponse();
    
    response.result = result;
    response.setProblem(problem);

    connection.send(response);
  }

  private createOkResponse
  (
    account: Account,
    character: Character,
    move: Move
  )
  {
    let response = new EnterGameResponse();

    response.result = EnterGameResponse.Result.OK;
    response.characterMove = move;
    response.setLoadLocation(character.getLoadLocation());

    return response;
  }

  private acceptRequest
  (
    connection: Connection,
    account: Account,
    character: Character,
    move: Move
  )
  {
    let response = this.createOkResponse(account, character, move);

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

// This overwrites ancestor class.
Classes.registerSerializableClass(EnterGameRequest);