/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Request to register a new account.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Request} from '../../../shared/lib/protocol/Request';
import {Classes} from '../../../shared/lib/class/Classes';

const VALID_EMAIL_CHARACTERS = "abcdefghijklmnopqrstuvwxyz"
  + "@ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&'*+-/=?^_`{|}~.";

export abstract class RegisterRequest extends Request
{
  constructor
  (
    public email: string,
    public password: string
  )
  {
    super();

    this.version = 0;
  }

  public static readonly MIN_EMAIL_LENGTH = 3;
  public static readonly MAX_EMAIL_LENGTH = 254;
  public static readonly MIN_PASSWORD_LENGTH = 4;
  public static readonly MAX_PASSWORD_LENGTH = 50;

  // ---------------- Public methods --------------------

  public checkEmail(): (RegisterRequest.Problem | "NO PROBLEM")
  {
    let checkResult: string;

    if ((checkResult = this.checkEmailLength()) !== "NO PROBLEM")
      return this.composeEmailProblem(checkResult);

    if ((checkResult = this.checkEmailByteLength()) !== "NO PROBLEM")
      return this.composeEmailProblem(checkResult);

    if ((checkResult = this.checkAmpersand()) !== "NO PROBLEM")
      return this.composeEmailProblem(checkResult);

    if ((checkResult = this.checkForInvalidCharacters()) !== "NO PROBLEM")
      return this.composeEmailProblem(checkResult);

    return "NO PROBLEM";
  }

  public checkPassword(): (RegisterRequest.Problem | "NO PROBLEM")
  {
    let checkResult: string;

    if ((checkResult = this.checkPasswordLength()) !== "NO PROBLEM")
      return this.composePasswordProblem(checkResult);

    return "NO PROBLEM";
  }

  // ---------------- Private methods -------------------

  private composeEmailProblem(message: string): RegisterRequest.Problem
  {
    return { type: RegisterRequest.ProblemType.EMAIL_PROBLEM, message };
  }

  private composePasswordProblem(message: string): RegisterRequest.Problem
  {
    return { type: RegisterRequest.ProblemType.PASSWORD_PROBLEM, message };
  }

  private checkEmailLength(): (string | "NO PROBLEM")
  {
    if (this.email.length < RegisterRequest.MIN_EMAIL_LENGTH)
    {
      return "E-mail address must be at least"
        + " " + RegisterRequest.MIN_EMAIL_LENGTH
        + " characters long.";
    }

    if (this.email.length > RegisterRequest.MAX_EMAIL_LENGTH)
    {
      return "E-mail address cannot be longer than"
        + " " + RegisterRequest.MAX_EMAIL_LENGTH
        + " characters.";
    }

    return "NO PROBLEM";
  }

  private checkEmailByteLength(): (string | "NO PROBLEM")
  {
    // There is a limit of 255 bytes to the length of file
    // name on most Unix file systems. It matters because we
    // use email address as an account name and thus as a file
    // name (after encoding it to escape characters and names
    // that are not valid in file name). Unfortunally the limit
    // is in bytes rather than characters which prevents us to
    // comprehensibly communicate to the user what the problem
    // is and how much shorter the adress must be. It wouldn't
    // be of much use anyways because email address is supposed
    // to already exist to be used as an account name. User just
    // has to use another email account with shorted address.
    if (!Utils.hasValidByteLengthAsFileName(this.email))
    {
      // 64 characters should be safe because there is maximum of
      // 4 bytes per character in utf-8 and one of them needs to
      // be '@' which uses less then 4 bytes. However, this may
      // not be true if address contains characters that need to
      // be escaped to be used in file name.
      return "E-mail address is too long (please try to pick one"
        + " that is up to 64 characters long).";
    }

    return "NO PROBLEM";
  }

  private checkAmpersand(): (string | "NO PROBLEM")
  {
    let splitArray = this.email.split('@');

    if (splitArray.length < 2)
      return "E-mail address must contain a '@'.";

    if (splitArray.length > 2)
      return "E-mail address can only contain one '@'.";

    if (splitArray[0].length < 1)
    {
      return "There must be at least 1 character"
        + " before '@' in an e-mail address.";
    }

    if (splitArray[1].length < 1)
    {
      return "There must be at least 1 character"
        + " after '@' in an e-mail address.";
    }

    return "NO PROBLEM";
  }

  private checkForInvalidCharacters(): (string | "NO PROBLEM")
  {
    // Check for invalid characters.
    for (let i = 0; i < this.email.length; i++)
    {
      // Is character at position 'i' present in VALID_EMAIL_CHARACTERS?
      if (VALID_EMAIL_CHARACTERS.indexOf(this.email.charAt(i)) === -1)
      {
        return "E-mail address cannot contain character"
          + " '" + this.email.charAt(i) + "'.";
      }
    }

    return "NO PROBLEM";
  }

  private checkPasswordLength(): (string | "NO PROBLEM")
  {
    if (this.password.length < RegisterRequest.MIN_PASSWORD_LENGTH)
    {
      return "Password must be at least"
        + " " + RegisterRequest.MIN_PASSWORD_LENGTH
        + " characters long.";
    }

    if (this.password.length > RegisterRequest.MAX_PASSWORD_LENGTH)
    {
      return "Password cannot be longer than"
        + " " + RegisterRequest.MAX_PASSWORD_LENGTH
        + " characters.";
    }

    return "NO PROBLEM"
  } 
}

// ------------------ Type declarations ----------------------

export module RegisterRequest
{
  export enum ProblemType
  {
    EMAIL_PROBLEM,
    PASSWORD_PROBLEM,
    ERROR
  }

  export type Problem =
  {
    type: ProblemType;
    message: string;
  }
}