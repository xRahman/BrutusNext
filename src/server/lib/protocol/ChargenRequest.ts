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
import {IncommingPacket} from '../../../shared/lib/protocol/IncommingPacket';
import {ChargenRequest as SharedChargenRequest} from
  '../../../shared/lib/protocol/ChargenRequest';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Admins} from '../../../server/lib/admin/Admins';
import {Account} from '../../../server/lib/account/Account';
import {Character} from '../../../server/game/character/Character';
import {Characters} from '../../../server/game/character/Characters';
import {Message} from '../../../server/lib/message/Message';
import {Connection} from '../../../server/lib/connection/Connection';
import {ChargenResponse} from '../../../shared/lib/protocol/ChargenResponse';
import {Classes} from '../../../shared/lib/class/Classes';

export class ChargenRequest
  extends SharedChargenRequest
  implements IncommingPacket
{
  constructor(characterName: string)
  {
    super(characterName);

    this.version = 0;
  }

  // ---------------- Public methods --------------------

  // ~ Overrides Packet.process().
  // -> Returns 'true' on success.
  public async process(connection: Connection): Promise<void>
  {
    this.normalizeCharacterName(connection);

    let problems = this.checkForProblems();

    if (problems)
    {
      this.denyRequest(problems, connection);
      return;
    }

    if (!await this.isNameAvailable())
    {
      this.sendNameIsNotAvailableResponse(connection);
      this.logNameIsNotAvailable(connection);
      return;
    }

    let account = this.obtainAccount(connection);

    if (!account)
    {
      this.sendErrorResponse(connection);
      return;
    }

    let character = await this.createCharacter(account, connection);

    if (!character)
    {
      this.sendErrorResponse(connection);
      return;
    }

    if (!this.acceptRequest(character, account, connection))
    {
      this.sendErrorResponse(connection);
      return;
    }

    this.logSuccess(character, account);

    return;
  }

  // --------------- Private methods --------------------

  private obtainAccount(connection: Connection): Account | null
  {
    let account = connection.getAccount();

    if (!account || !account.isValid())
    {
      ERROR("Failed to process chargen request: Invalid account");
      return null;
    }

    return account;
  }

  private normalizeCharacterName(connection: Connection)
  {
    this.characterName = Utils.uppercaseFirstLowercaseRest(this.characterName);
  }

  private sendErrorResponse(connection: Connection)
  {
    const problems: SharedChargenRequest.Problems =
    {
      error: "[ERROR]: Failed to create character.\n\n"
              + Message.ADMINS_WILL_FIX_IT
    };
    
    this.denyRequest(problems, connection);
  }

  // -> Returns 'null' on failure.
  private async createCharacter
  (
    account: Account,
    connection: Connection
  )
  : Promise<Character | null>
  {
    if (!this.characterName)
    {
      ERROR("Invalid 'characterName' in chargen request");
      return null;
    }

    let character = await account.createCharacter(this.characterName);

    if (!character || !character.isValid())
      return null;

    Admins.onCharacterCreation(character);

    return character;
  }

  private async isNameAvailable(): Promise<boolean>
  {
    if (!this.characterName)
      return false;

    /// TODO: Časem asi nějaké přísnější testy - například nepovolit jméno,
    ///   když existuje jeho hodně blízký prefix.
    /// (tzn otestovat abbreviations od
    ///  ChargenRequest.MIN_CHARACTER_NAME_LENGTH
    ///  do name.length - 1).
    /// Asi taky nepovolit slovníková jména.

    if (await Characters.isTaken(this.characterName))
      return false;

    return true;
  }

  private sendCharacterNameProblemResponse
  (
    problem: string,
    connection: Connection
  )
  {
    this.denyRequest({ characterNameProblem: problem }, connection);
  }

  private sendNameIsNotAvailableResponse(connection: Connection)
  {
    this.denyRequest
    (
      { characterNameProblem: "Sorry, this name is not available." },
      connection
    );
  }

  private logNameIsNotAvailable(connection: Connection)
  {
    Syslog.logConnectionInfo
    (
      "User " + connection.getUserInfo() + " has attempted"
        + " to create new character using existing name"
        + " (" + this.characterName + ")"
    );
  }

  // -> Returns 'true' on success.
  private acceptRequest
  (
    character: Character,
    account: Account,
    connection: Connection
  )
  {
    let response = new ChargenResponse();

    if (!response.serializeAccount(account))
      return false;

    if (!response.serializeCharacter(character))
      return false;

    connection.send(response);

    return true;
  }

  private logSuccess(character: Character, account: Account)
  {
    Syslog.logSystemInfo
    (
      "Player " + account.getEmail() + " has created"
        + " a new character: " + character.getName()
    );
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