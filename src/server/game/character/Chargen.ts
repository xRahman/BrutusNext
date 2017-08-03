/*
  Part of BrutusNEXT

  Character creation.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Admins} from '../../../server/lib/admin/Admins';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Character} from '../../../server/game/character/Character';
import {Characters} from '../../../server/game/character/Characters';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Connection} from '../../../server/lib/connection/Connection';
import {ChargenRequest} from '../../../shared/lib/protocol/ChargenRequest';
import {ChargenResponse} from '../../../shared/lib/protocol/ChargenResponse';

export class Chargen
{
  // ------------- Public static methods ----------------

  public static async processRequest
  (
    request: ChargenRequest,
    connection: Connection
  )
  {
    request.normalizeCharacterName();

    if (!this.isConnectionValid(connection))
      return;

    if (!this.isRequestValid(request, connection))
      return;

    if (!await this.isNameAvailable(request, connection))
      return;

    await this.processCharacterCreation(request, connection);
  }

  // ------------- Private static methods ---------------

  private static async processCharacterCreation
  (
    request: ChargenRequest,
    connection: Connection
  )
  {
    let character = await this.createCharacter(request, connection);

    if (!character)
    {
      this.denyRequest
      (
        "[ERROR]: Failed to create character.\n\n"
          + Message.ADMINS_WILL_FIX_IT,
        ChargenResponse.Result.FAILED_TO_CREATE_CHARACTER,
        connection
      );
      return;
    }

    // Promote character to the highest admin level if there
    // are no admins yet (the first character created on fresh
    // server automaticaly becomes admin).
    Admins.onCharacterCreation(character);

    this.acceptRequest(character, connection);
  }

  private static async createCharacter
  (
    request: ChargenRequest,
    connection: Connection
  )
  {
    if (!connection)
    {
      ERROR("Invalid connection, character is not created");
      return null;
    }

    let account = connection.account;

    if (!Entity.isValid(account))
    {
      ERROR("Invalid account, character is not created");
      return null;
    }

    return await account.createCharacter(request.characterName);
  }

  private static isRequestValid
  (
    request: ChargenRequest,
    connection: Connection
  )
  : boolean
  {
    if (!this.isCharacterNameValid(request, connection))
      return false;

    return true;
  }

  private static async isNameAvailable
  (
    request: ChargenRequest,
    connection: Connection
  )
  : Promise<boolean>
  {
    /// TODO: Časem asi nějaké přísnější testy - například nepovolit jméno,
    ///   když existuje jeho hodně blízký prefix.
    /// (tzn otestovat abbreviations od
    ///  ChargenRequest.MIN_CHARACTER_NAME_LENGTH
    ///  do name.length - 1).
    /// Asi taky nepovolit slovníková jména.

    if (await Characters.isTaken(request.characterName))
    {
      this.denyRequest
      (
        "Sorry, this name is not available.",
        ChargenResponse.Result.CHARACTER_NAME_PROBLEM,
        connection
      );

      Syslog.log
      (
        "User " + connection.getUserInfo() + " has attempted"
          + " to create new character using existing name"
          + " (" + request.characterName + ")",
        MessageType.CONNECTION_INFO,
        AdminLevel.IMMORTAL
      );

      return false;
    }

    return true;
  }

  private static isCharacterNameValid
  (
    request: ChargenRequest,
    connection: Connection
  )
  : boolean
  {
    let problem = request.getCharacterNameProblem();

    if (!problem)
      return true;

    this.denyRequest
    (
      problem,
      ChargenResponse.Result.CHARACTER_NAME_PROBLEM,
      connection
    );

    /// This is probably too trival to log.
    // Syslog.log
    // (
    //   "Attempt to create character with invalid name"
    //     + " (" + request.characterName + ")."
    //     + " Problem: " + problem,
    //   MessageType.CONNECTION_INFO,
    //   AdminLevel.IMMORTAL
    // );
    
    return false;
  }

  private static acceptRequest(character: Character, connection: Connection)
  {
    let response = new ChargenResponse();

    response.result = ChargenResponse.Result.OK;
    response.setAccount(connection.account);
    response.setCharacter(character);

    Syslog.log
    (
      "Player " + connection.account.getEmail() + " has created"
        + " a new character: " + character.getName(),
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    connection.send(response);
  }

  private static denyRequest
  (
    problem: string,
    result: ChargenResponse.Result,
    connection: Connection
  )
  {
    let response = new ChargenResponse();

    response.result = result;
    response.problem = problem;

    connection.send(response);
  }

  private static isConnectionValid(connection: Connection)
  {
    if (!connection)
      return false;

    if (connection.account === null)
    {
      ERROR("Chargen request is triggered on connection that has"
        + " no account attached to it. Request is not processed");
      return false;
    }

    return true;
  }
}
