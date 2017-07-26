/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Request to register a new account.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Packet} from '../../../shared/lib/protocol/Packet';
import {Classes} from '../../../shared/lib/class/Classes';

const VALID_EMAIL_CHARACTERS = "abcdefghijklmnopqrstuvwxyz"
  + "@ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&'*+-/=?^_`{|}~.";

export class RegisterRequest extends Packet
{
  constructor()
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

  public email: string = null;
  public password: string = null;

  // ---------------- Public methods --------------------

  // -> Returns 'null' if email is ok,
  //    othwrwise returns the first found reason why it's not.
  public getEmailProblem(): string
  {
    let problem = null;

    if (!this.email)
      return "E-mail address must not be empty.";

    if (problem = this.getEmailLengthProblem())
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

Classes.registerSerializableClass(RegisterRequest);