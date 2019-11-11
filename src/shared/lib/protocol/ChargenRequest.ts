/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Character creation request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {Request} from '../../../shared/lib/protocol/Request';
import {Connection} from '../../../shared/lib/connection/Connection';
import {Classes} from '../../../shared/lib/class/Classes';

export abstract class ChargenRequest extends Request
{
  constructor
  (
    public characterName: string
  )
  {
    super();

    this.version = 0;
  }

  public static readonly MIN_NAME_LENGTH_CHARACTERS = 3;
  public static readonly MAX_NAME_LENGTH_CHARACTERS = 12;

  public static readonly VALID_CHARACTERS_REGEXP = /[^A-Za-z]/gi;

  // ----------------- Public data ----------------------

  // ---------------- Public methods --------------------

  public checkForProblems(): Array<ChargenRequest.Problem> | "NO PROBLEM"
  {
    let problems: Array<ChargenRequest.Problem> = [];
    let checkResult: ChargenRequest.Problem | "NO PROBLEM";
  
    if ((checkResult = this.checkCharacterName()) !== "NO PROBLEM")
      problems.push(checkResult);

    if (problems.length !== 0)
      return problems;

    return "NO PROBLEM";
  }

  // --------------- Protected methods ------------------

  protected nameProblem(message: string): ChargenRequest.Problem
  {
    let problem =
    {
      type: ChargenRequest.ProblemType.CHARACTER_NAME_PROBLEM,
      message: message
    };

    return problem;
  }

  // ---------------- Private methods -------------------

  private checkCharacterName(): (ChargenRequest.Problem | "NO PROBLEM")
  {
    let checkResult: ChargenRequest.Problem | "NO PROBLEM";

    if ((checkResult = this.checkNameLength()) !== "NO PROBLEM")
      return checkResult;

    if ((checkResult = this.checkForInvalidCharacters()) !== "NO PROBLEM")
      return checkResult;

    return "NO PROBLEM";
  }

  // Note that this is also enforced in
  // ChargenForm.removeInvalidCharacters().
  private checkForInvalidCharacters(): (ChargenRequest.Problem | "NO PROBLEM")
  {
    const regExp = ChargenRequest.VALID_CHARACTERS_REGEXP;

    if (regExp.test(this.characterName))
    {
      return this.nameProblem
      (
        "Character name can only contain english letters."
      );
    }

    return "NO PROBLEM";
  }

  private checkNameLength(): (ChargenRequest.Problem | "NO PROBLEM")
  {
    if (!this.characterName)
      return this.nameProblem("Please enter character name.");

    let nameLength = this.characterName.length;

    if (nameLength < ChargenRequest.MIN_NAME_LENGTH_CHARACTERS)
    {
      return this.nameProblem
      (
        "Name must be at least"
        + " " + ChargenRequest.MIN_NAME_LENGTH_CHARACTERS
        + " characters long."
      );
    }

    if (nameLength > ChargenRequest.MAX_NAME_LENGTH_CHARACTERS)
    {
      return this.nameProblem
      (
        "Name cannot be longer than"
        + " " + ChargenRequest.MAX_NAME_LENGTH_CHARACTERS
        + " characters."
      );
    }

    return "NO PROBLEM";
  }
}

// ------------------ Type declarations ----------------------

export module ChargenRequest
{
  export enum ProblemType
  {
    CHARACTER_NAME_PROBLEM,
    ERROR
  };

  export type Problem =
  {
    type: ProblemType;
    message: string;
  };
}