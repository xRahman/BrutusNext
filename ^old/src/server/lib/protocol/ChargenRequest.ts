/*
  Part of BrutusNEXT

  Server-side functionality related to character creation request packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {REPORT} from '../../../shared/lib/error/REPORT';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {ChargenRequest as SharedChargenRequest} from
  '../../../shared/lib/protocol/ChargenRequest';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Admins} from '../../../server/lib/admin/Admins';
import {Account} from '../../../server/lib/account/Account';
import {Character} from '../../../server/game/character/Character';
import {Characters} from '../../../server/game/character/Characters';
import {Message} from '../../../server/lib/message/Message';
import {Connection} from '../../../server/lib/connection/Connection';
import {ChargenResponse} from '../../../server/lib/protocol/ChargenResponse';
import {Classes} from '../../../shared/lib/class/Classes';

export class ChargenRequest extends SharedChargenRequest
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
    let response: ChargenResponse;

    try
    {
      response = await this.generateCharacter(connection);
    }
    catch (error)
    {
      REPORT(error);
      response = this.errorResponse();
    }

    connection.send(response);
  }

  // This method is overriden so we don't need to send list of forbiden
  // names to the client and only check for them on the server.
  // ~ Overrides ChargenRequest.checkForProblems().
  public checkForProblems(): Array<ChargenRequest.Problem> | "NO PROBLEM"
  {
    if (this.isNameValid())
      return super.checkForProblems();

    let problem = this.nameNotAvailableProblem();
    let problems = super.checkForProblems();

    if (problems === "NO PROBLEM")
      return [ problem ];

    problems.push(problem);

    return problems;
  }

  // --------------- Private methods --------------------

  // ! Throws an exception on error.
  private async generateCharacter
  (
    connection: Connection
  )
  : Promise<ChargenResponse>
  {
    let checkResult: Array<ChargenRequest.Problem> | "NO PROBLEM";

    if ((checkResult = this.checkForProblems()) !== "NO PROBLEM")
      return this.problemsResponse(checkResult);

    let account: Account = connection.getAccount();
    let createResult = await this.createCharacter(account, connection);

    if (createResult === "NAME IS ALREADY TAKEN")
    {
      this.logNameAlreadyTaken(connection);
      return this.nameNotAvailableResponse();
    }

    let character: Character = createResult;

    this.logSuccess(character, account);

    return this.successResponse(character, account);
  }

  // ! Throws an exception on error.
  private async createCharacter
  (
    account: Account,
    connection: Connection
  )
  : Promise<Character | "NAME IS ALREADY TAKEN">
  {
    if (!this.characterName)
      throw new Error("Invalid 'characterName' in chargen request");

    let characterName = Utils.uppercaseFirstLowercaseRest(this.characterName);

    let createResult = await account.createCharacter(characterName);

    if (createResult === "NAME IS ALREADY TAKEN")
      return "NAME IS ALREADY TAKEN";

    let character: Character = createResult;

    Admins.onCharacterCreation(character);

    return character;
  }

  private async isNameValid(): Promise<boolean>
  {
    if (!this.characterName)
      return false;

    /// TODO: Časem asi nějaké přísnější testy - například nepovolit jméno,
    ///   když existuje jeho hodně blízký prefix.
    /// (tzn otestovat abbreviations od
    ///  ChargenRequest.MIN_CHARACTER_NAME_LENGTH
    ///  do name.length - 1).
    /// Asi taky nepovolit slovníková jména.

    /// This will be checked inside character creation attempt.
    // if (await Characters.isTaken(this.characterName))
    //   return false;

    return true;
  }

  private logNameAlreadyTaken(connection: Connection)
  {
    Syslog.logConnectionInfo
    (
      "Player " + connection.getUserInfo() + " attempts"
        + " to create new character using name"
        + " (" + this.characterName + ") that is"
        + " already taken"
    );
  }

  private logSuccess(character: Character, account: Account)
  {
    Syslog.logSystemInfo
    (
      "Player " + account.getEmail() + " has created"
        + " a new character: " + character.getName()
    );
  }

  private nameNotAvailableProblem(): ChargenRequest.Problem
  {
    return this.nameProblem("Sorry, this name is not available.");
  }

  private nameNotAvailableResponse()
  {
    return this.problemsResponse([ this.nameNotAvailableProblem() ]);
  }

  private errorResponse(): ChargenResponse
  {
    let problem: ChargenRequest.Problem =
    {
      type: ChargenRequest.ProblemType.ERROR,
      message: "An error occured while creating your character.\n\n"
                + Message.ADMINS_WILL_FIX_IT
    };

    let result: ChargenResponse.Result =
    {
      status: "REJECTED",
      problems: [ problem ]
    };

    return new ChargenResponse(result);
  }

  private problemsResponse
  (
    problems: Array<ChargenRequest.Problem>
  )
  : ChargenResponse
  {
    let result: ChargenResponse.Result =
    {
      status: "REJECTED",
      problems: problems
    };

    return new ChargenResponse(result);
  }

  // ! Throws an exception on error.
  private successResponse
  (
    character: Character,
    account: Account
  )
  : ChargenResponse
  {
    let serializedAccount = this.serializeEntity(account);
    let serializedCharacter = this.serializeEntity(character);

    let result: ChargenResponse.Result =
    {
      status: "ACCEPTED",
      data: { serializedAccount, serializedCharacter }
    };

    return new ChargenResponse(result);
  }
}

// ------------------ Type declarations ----------------------

export module ChargenRequest
{
  // Reexport ancestor types becuase they are not inherited automatically.
  export type Problem = SharedChargenRequest.Problem;
}

Classes.registerSerializableClass(ChargenRequest);