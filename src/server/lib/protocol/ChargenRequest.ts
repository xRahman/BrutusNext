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
import {Utils} from '../../../shared/lib/utils/Utils';
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
  // -> Returns 'true' on success.
  public async process(connection: Connection): Promise<boolean>
  {
    let characterName = this.normalizeCharacterName(connection);

    if (!characterName)
      return false;

    if (!this.isRequestValid(connection))
      return false;

    if (!await this.isNameAvailable(characterName, connection))
      return false;

    return await this.createCharacter(characterName, connection);
  }

  // --------------- Private methods --------------------

  // -> Returns 'null' on failure.
  private normalizeCharacterName(connection: Connection): string | null
  {
    if (!this.characterName)
    {
      ERROR("Missing character name in chargen request");
      this.sendFailureResponse(connection);
      return null;
    }

    return Utils.uppercaseFirstLowercaseRest(this.characterName);
  }

  private sendFailureResponse(connection: Connection)
  {
    const problems: SharedChargenRequest.Problems =
    {
      characterCreationError:
        "[ERROR]: Failed to create character.\n\n"
          + Message.ADMINS_WILL_FIX_IT
    };
    
    this.denyRequest(problems, connection);
  }

  private async createCharacter(characterName: string, connection: Connection)
  {
    let account = connection.getAccount();

    if (!account)
    {
      ERROR("Failed to process chargen request:"
        + " No account is attached to connection");
      this.sendFailureResponse(connection);
      return false;
    }

    let character = await account.createCharacter(characterName);

    if (!character)
    {
      this.sendFailureResponse(connection);
      return false;
    }

    Admins.onCharacterCreation(character);

    this.acceptRequest(character, connection, account);

    return true;
  }

  // -> Returns 'false' on failure.
  private isRequestValid(connection: Connection): boolean
  {
    let problems = this.checkForProblems();

    if (problems)
    {
      this.denyRequest(problems, connection);
      return false;
    }

    return true;
  }

  private async isNameAvailable
  (
    characterName: string,
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

    if (await Characters.isTaken(characterName))
    {
      this.denyRequest
      (
        { characterNameProblem: "Sorry, this name is not available." },
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

  private acceptRequest
  (
    character: Character,
    connection: Connection,
    account: Account
  )
  {
    let response = new ChargenResponse();

    response.setAccount(account);
    response.setCharacter(character);

    Syslog.log
    (
      "Player " + account.getEmail() + " has created"
        + " a new character: " + character.getName(),
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    connection.send(response);
  }

  private denyRequest
  (
    problems: SharedChargenRequest.Problems,
    connection: Connection
  )
  {
    let response = new ChargenResponse();

    response.setProblems(problems);
    connection.send(response);
  }
}

// This overwrites ancestor class.
Classes.registerSerializableClass(ChargenRequest);