/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Request to register a new account.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Packet} from '../../../shared/lib/protocol/Packet';
import {Classes} from '../../../shared/lib/class/Classes';

export class RegisterRequest extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  public static get MIN_ACCOUNT_NAME_LENGTH()
    { return  3;}
  public static get MAX_ACCOUNT_NAME_LENGTH()
    { return  20;}
  public static get MIN_PASSWORD_LENGTH()
    { return  4;}
  public static get MAX_PASSWORD_LENGTH()
    { return  50;}

  public accountName: string = null;
  public email: string = null;
  public password: string = null;

  public isValid(): boolean
  {
    let isValid = true;

    if (!this.accountName)
    {
      ERROR("Missing or invalid 'accountName' in login request");
      isValid = false;
    }

    if (!this.email)
    {
      ERROR("Missing or invalid 'email' in login request");
      isValid = false;
    }

    if (!this.password)
    {
      ERROR("Missing or invalid 'password' in login request");
      isValid = false;
    }

    return isValid;
  }

  // -> Returns 'null' if request is ok,
  //    othwrwise returns the first found reason why it's not.
  public getProblem()
  {
    let problem;

    if (problem = this.getAccountNameProblem())
      return problem;

    if (problem = this.getEmailProblem())
      return problem;

    if (problem = this.getPasswordProblem())
      return problem;

    return null;
  }

  // -> Returns 'null' if accountName is ok,
  //    othwrwise returns the first found reason why it's not.
  private getAccountNameProblem(): string
  {
    if (!this.accountName)
      return "Account name must not be empty.";

    // 'only letters' variant:
    // let regExp = /[^A-Za-z]/;
    let regExp = /[^A-Za-z0-9]/;

    if (regExp.test(this.accountName))
      return "Account name can only contain numbers and english letters.";

    if (this.accountName.length < RegisterRequest.MIN_ACCOUNT_NAME_LENGTH)
    {
      return "Account name must be at least"
        + " " + RegisterRequest.MIN_ACCOUNT_NAME_LENGTH
        + " characters long";
    }

    if (this.accountName.length > RegisterRequest.MAX_ACCOUNT_NAME_LENGTH)
    {
      return "Account name cannot be longer than"
        + " " + RegisterRequest.MAX_ACCOUNT_NAME_LENGTH
        + " characters";
    }

    return null;
  }

  // -> Returns 'null' if email is ok,
  //    othwrwise returns the first found reason why it's not.
  private getEmailProblem(): string
  {
    if (!this.email)
      return "Email address must not be empty.";

    let splitArray = this.email.split('@');

    if (splitArray.length < 2)
      return "Email address must contain a '@'.";

    if (splitArray.length > 2)
      return "Email address can only contain one '@'.";

    if (splitArray[0].length < 1)
    {
      return "There must be at least 1 character"
        + " before '@' in an email address.";
    }

    if (splitArray[1].length < 1)
    {
      return "There must be at least 1 character"
        + " after '@' in an email address.";
    }

    // Characters allowed in email address.
    /// TODO:
    /*
    "^[a-zA-Z0-9\"!#$%&'*+\-/=?^_`{|}~.]+$"
    let regExp = new RegExp("!#$%&'*+-/=?^_`{|}~.", 'g');

    /// Asi by bylo dobré říct, jaký nepovolený character
    /// ve stringu je.
    if (string.match("a-zA-Z0-9\"!#$%&'*+\-/=?^_`{|}~."))
      return ""
    */

    return null;
  }

  // -> Returns 'null' if password is ok,
  //    othwrwise returns the first found reason why it's not.
  private getPasswordProblem(): string
  {
    if (!this.password)
      return "Password must not be empty.";

    if (this.password.length < RegisterRequest.MIN_PASSWORD_LENGTH)
    {
      return "Password must be at least"
        + " " + RegisterRequest.MIN_PASSWORD_LENGTH
        + " characters long";
    }

    if (this.password.length > RegisterRequest.MAX_PASSWORD_LENGTH)
    {
      return "Password cannot be longer than"
        + " " + RegisterRequest.MAX_PASSWORD_LENGTH
        + " characters";
    }

    return null;
  }
}

Classes.registerSerializableClass(RegisterRequest);