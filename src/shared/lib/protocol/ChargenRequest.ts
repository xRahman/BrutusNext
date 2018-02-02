/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Character creation request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Request} from '../../../shared/lib/protocol/Request';
import {Connection} from '../../../shared/lib/connection/Connection';
import {Classes} from '../../../shared/lib/class/Classes';

export class ChargenRequest extends Request
{
  constructor()
  {
    super();

    this.version = 0;
  }

  private static get MISSING_CHARACTER_NAME_MESSAGE()
    { return "Please enter character name."; }

  public static get MIN_NAME_LENGTH_CHARACTERS()
    { return  3;}
  public static get MAX_NAME_LENGTH_CHARACTERS()
    { return  12;}

  public static get VALID_CHARACTERS_REGEXP()
    { return /[^A-Za-z]/gi; }

  // ----------------- Public data ----------------------

  public characterName: (string | null) = null;

  // ---------------- Public methods --------------------

  // -> Returns 'null' if no problem is found.
  public checkForProblems(): ChargenRequest.Problems | null
  {
    let characterNameProblem = this.checkCharacterName();

    if (characterNameProblem)
    {
      let problems: ChargenRequest.Problems =
      {
        characterNameProblem: characterNameProblem
      };

      return problems;
    }

    return null;
  }

  // ~ Overrides Packet.process().
  // -> Returns 'true' on success.
  public async process(connection: Connection)
  {
    ERROR("Attempt to call /shared/protocol/ChargenRequest.process()."
      + " That's not supposed to happen, only /server/protocol/ChargenRequest"
      + " can be processed");

    return false;
  }

  // ---------------- Private methods -------------------

  // -> Returns 'null' if character name is ok,
  //    or the first found reason why it's not.
  private checkCharacterName()
  {
    let problem: (string | null) = null;

    if (!this.characterName)
      return ChargenRequest.MISSING_CHARACTER_NAME_MESSAGE;

    if (problem = this.checkInvalidCharacters())
      return problem;

    if (problem = this.checkNameLength())
      return problem;

    return null;
  }

  // Note that this is also enforced in
  // ChargenForm.removeInvalidCharacters().
  // -> Returns problem description if there is a problem,
  //    Returns 'null' if no problem is found.
  private checkInvalidCharacters(): string | null
  {
    const regExp = ChargenRequest.VALID_CHARACTERS_REGEXP;

    if (!this.characterName)
      return ChargenRequest.MISSING_CHARACTER_NAME_MESSAGE;

    if (regExp.test(this.characterName))
      return "Character name can only contain english letters.";

    return null;
  }

  // -> Returns problem description if there is a problem,
  //    Returns 'null' if no problem is found.
  private checkNameLength(): string | null
  {
    if (!this.characterName)
      return ChargenRequest.MISSING_CHARACTER_NAME_MESSAGE;

    if (this.characterName.length < ChargenRequest.MIN_NAME_LENGTH_CHARACTERS)
    {
      return "Name must be at least"
        + " " + ChargenRequest.MIN_NAME_LENGTH_CHARACTERS
        + " characters long.";
    }

    if (this.characterName.length > ChargenRequest.MAX_NAME_LENGTH_CHARACTERS)
    {
      return "Name cannot be longer than"
        + " " + ChargenRequest.MAX_NAME_LENGTH_CHARACTERS
        + " characters.";
    }

    return null;
  }
}

// ------------------ Type declarations ----------------------

export module ChargenRequest
{
  export interface Problems extends Request.Problems
  {
    characterNameProblem?: string;
    error?: string;
  }
}

Classes.registerSerializableClass(ChargenRequest);