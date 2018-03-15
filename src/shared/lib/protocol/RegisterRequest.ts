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

export class RegisterRequest extends Request
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

  public static get MIN_EMAIL_LENGTH()
    { return  3;}
  public static get MAX_EMAIL_LENGTH()
    { return  254;}
  public static get MIN_PASSWORD_LENGTH()
    { return  4;}
  public static get MAX_PASSWORD_LENGTH()
    { return  50;}

  // ----------------- Public data ----------------------

  /// Moved to constructor
  // public email: (string | null) = null;
  // public password: (string | null) = null;

  // ---------------- Public methods --------------------

  // -> Returns 'null' if email is ok,
  //    othwrwise returns the first found reason why it's not.
  public getEmailProblem(): string
  {
    let problem: (string | null) = null;

    if (!this.email)
      return "E-mail address must not be empty.";

    if (problem = this.getEmailLengthProblem())
      return problem;

    if (problem = this.getEmailByteLengthProblem())
      return problem;

    if (problem = this.getAmpersandProblem())
      return problem;

    if (problem = this.getInvalidCharacterProblem())
      return problem;

    return null;  // No problem found.
  }

  // -> Returns 'null' if password is ok,
  //    othwrwise returns the first found reason why it's not.
  public getPasswordProblem(): string
  {
    if (!this.password)
      return "Password must not be empty.";

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

    return null;
  }

  // ---------------- Private methods -------------------

  private getEmailLengthProblem()
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

    return null;
  }

  private getEmailByteLengthProblem()
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

    return null;
  }

  private getAmpersandProblem()
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

    return null;
  }

  private getInvalidCharacterProblem()
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

    return null;
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
  };

  export type Problem =
  {
    type: ProblemType;
    problem: string;
  };

  export type Problems = Array<Problem>;

  export type Result = Request.Accepted | Problems;

  /// Ještě možná jinak: Buď jsou tam nějaké problémy či errory
  /// (tzn. asi existuje aspoň jedna property), nebo je to ok.
  /// - takže by to vlastně byl jeden objekt s několika nepovinnejma
  ///   propertama.
  /// Otázka jen je, jak kontrolovat, že jsem checknul všechny
  /// (tzn. když přidám "problémovou" property, že to na klientovi
  ///  nebude zobrazovat "všechno v pořádku").
  /// ... Ehm - stačí checknout, jeslti to je prázdný objekt - i když,
  /// to vlastně asi jednoduše nejde...
  /// Šlo by použít: 'if (Object.keys(obj).length === 0)'

  // export type Problems =
  // {
  //   emailProblem?: string;
  //   passwordProblem?: string;
  // }

  // export type Result = Request.Accepted | Request.Error | Problems;

  // export type EmailProblem =
  // {
  //   result: "EMAIL PROBLEM";
  //   problem: string;
  // }

  // export type PasswordProblem =
  // {
  //   result: "EMAIL PROBLEM";
  //   problem: string;
  // }

  // export type Problems =
  //   Request.Accepted | Request.Error | CharacterNameProblem;


  // export interface Problems extends Request.Problems
  // {
  //   characterNameProblem?: string;
  //   error?: string;
  // }
}

Classes.registerSerializableClass(RegisterRequest);