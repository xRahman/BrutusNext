/*
  Part of BrutusNEXT

  Server-side functionality related to character creation request packet.
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
import {ChargenRequest as SharedChargenRequest} from
  '../../../shared/lib/protocol/ChargenRequest';
import {Entity} from '../../../shared/lib/entity/Entity';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Admins} from '../../../server/lib/admin/Admins';
import {Account} from '../../../server/lib/account/Account';
import {Character} from '../../../server/game/character/Character';
import {Characters} from '../../../server/game/character/Characters';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Connection} from '../../../server/lib/connection/Connection';
import {ChargenResponse} from '../../../shared/lib/protocol/ChargenResponse';
import {Classes} from '../../../shared/lib/class/Classes';

export class ChargenRequest extends SharedChargenRequest
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
    this.normalizeCharacterName();
    
    if (!this.isConnectionValid(connection))
      return;

    if (!this.isRequestValid(connection))
      return;

    if (!await this.isNameAvailable(connection))
      return;

    await this.processCharacterCreation(connection);
  }

  // --------------- Private methods --------------------

  private async processCharacterCreation(connection: Connection)
  {
    let character = await this.createCharacter(connection);

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

  private async createCharacter(connection: Connection)
  {
    if (!connection)
    {
      ERROR("Invalid connection, character is not created");
      return null;
    }

    let account = connection.account;

    if (!account || !account.isValid())
    {
      ERROR("Invalid account, character is not created");
      return null;
    }

    return await account.createCharacter(this.characterName);
  }

  private isRequestValid(connection: Connection): boolean
  {
    if (!this.isCharacterNameValid(connection))
      return false;

    return true;
  }

  private async isNameAvailable(connection: Connection): Promise<boolean>
  {
    /// TODO: Časem asi nějaké přísnější testy - například nepovolit jméno,
    ///   když existuje jeho hodně blízký prefix.
    /// (tzn otestovat abbreviations od
    ///  ChargenRequest.MIN_CHARACTER_NAME_LENGTH
    ///  do name.length - 1).
    /// Asi taky nepovolit slovníková jména.

    if (await Characters.isTaken(this.characterName))
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
          + " (" + this.characterName + ")",
        MessageType.CONNECTION_INFO,
        AdminLevel.IMMORTAL
      );

      return false;
    }

    return true;
  }

  private isCharacterNameValid(connection: Connection): boolean
  {
    let problem = this.getCharacterNameProblem();

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
    //     + " (" + this.characterName + ")."
    //     + " Problem: " + problem,
    //   MessageType.CONNECTION_INFO,
    //   AdminLevel.IMMORTAL
    // );
    
    return false;
  }

  private createOkResponse(account: Account, character: Character)
  {
    let response = new ChargenResponse();

    response.result = ChargenResponse.Result.OK;
    response.setAccount(account);
    response.setCharacter(character);

    return response;
  }

  private acceptRequest(character: Character, connection: Connection)
  {
    let response = this.createOkResponse(connection.account, character);

    Syslog.log
    (
      "Player " + connection.account.getEmail() + " has created"
        + " a new character: " + character.getName(),
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    connection.send(response);
  }

  private denyRequest
  (
    problem: string,
    result: ChargenResponse.Result,
    connection: Connection
  )
  {
    let response = new ChargenResponse();

    response.result = result;
    response.setProblem(problem);

    connection.send(response);
  }

  private isConnectionValid(connection: Connection)
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

// This overwrites ancestor class.
Classes.registerSerializableClass(ChargenRequest);