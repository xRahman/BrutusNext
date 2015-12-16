/*
  Part of BrutusNEXT

  Handles user authentication.
*/

/*
  Implementation note:
    The system is built to use user accounts separated from characters,
    so you could for example have more than one character on a single
    account.

    However, currently the game is set up so that there is no need for
    a user to have more characters. So we'll just pretend that we are
    creating a character even though it's actually an account.

  Security note:
    Sending unencrypted password is... Well let's hope its temporary
    solution.

    Problem je, ze pres telnet se nic jineho posilat neda. Zatim me napada
    jedine reseni: Svazat account s mailovou adresou a posilat jednorazove
    "heslo" pokazde, kdyz se chce hrac lognout. Pripadne pridat moznost
    lognout zapamatovat si ipcko a povolit z nej logovat bez hesla, aby to
    nebyla takova pruda.

  // BTW pouzivat mailovou adresu jako account name neni dobry napad, protoze
  // by se stejne jako heslo posilala nezakryptovane, tzn. by ji nekdo mohl
  // takhle zjistit a bud zkouset hacknout, nebo alespon otravovat password
  // resetama.

  Ted to kazdopadne resit nebudu.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {PlayerConnection} from '../server/PlayerConnection';
import {Server} from '../server/Server';
import {AccountManager} from '../server/AccountManager';

export class AuthProcessor
{
  // In this special case it's ok to hold direct reference to
  // PlayerConnection, because instance of AuthProcessor
  // is owned by the very PlayerConnection we are storing reference
  // of here. In any other case, unique stringId of PlayerConnection (within
  // PlayerConnectionManager) needs to be used instead of a direct reference!
  constructor(protected myPlayerConnection: PlayerConnection) {}

  // ---------------- Public methods --------------------

  public get accountName() { return this.myAccountName; }

  public processCommand(command: string)
  {
    switch (this.myStage)
    {
      case AuthProcessor.stage.INITIAL:
        ASSERT(false, "AuthProcessor has not yet been initialized, it is not"
          + " supposed to process any commands yet");
        break;
      case AuthProcessor.stage.LOGIN:
        this.loginAttempt(command);
        break;
      case AuthProcessor.stage.PASSWORD:
        this.checkPassword(command);
        break;
      case AuthProcessor.stage.NEW_PASSWORD:
        this.getNewPassword(command);
        break;
      case AuthProcessor.stage.DONE:
        ASSERT(false, "AuthProcessor has already done it's job, it is not"
          + " supposed to process any more commands");
        break;
      default:
        ASSERT(false, "Unknown stage");
        break;
    }
  }

  public startLoginProcess()
  {
    this.myPlayerConnection.send("&GWelcome to &RBrutus &YNext!\r\n"
      + "&wBy what name do you wish to be known? ");

/// Account name variant:
///    this.myPlayerConnection.send("&GWelcome to the &RBrutus &YNext!\r\n"
///      + "By what account name do you want to be recognized? ");

    this.myStage = AuthProcessor.stage.LOGIN;
  }

  // -------------- Protected class data ----------------

  protected static stage =
  {
    INITIAL: 0, // Initial stage.
    LOGIN: 1,
    PASSWORD: 2,
    NEW_PASSWORD: 3,
    DONE: 4
  }

  protected myStage = AuthProcessor.stage.INITIAL;

  protected myAccountName = "";

  // --------------- Protected methods ------------------

  protected loginAttempt(accountName: string)
  {
    if (!this.isAccountNameValid(accountName))
      // We don't advance the stage so the next user input will trigger
      // a loginAttempt() again.
      return;

    // Make the first letter uppercase and the rest lowercase.
    accountName = accountName[0].toUpperCase()
      + accountName.toLowerCase().substr(1);

    // We are not going to attempt to log in to this account untill we receive
    // password so we need to remember account name until then.
    this.myAccountName = accountName;

    if (Server.accountManager.exists(accountName))
    {
      // Existing user. Ask for password.
      this.myPlayerConnection.send("&wPassword: ");
      this.myStage = AuthProcessor.stage.PASSWORD;
    }
    else
    {
      // New user. Ask for a new password.
      this.myPlayerConnection.send("&wCreating a new character...\r\n"
        + "Please enter a password you want to use to log in: ");
/// Account name variant
///      this.myPlayerConnection.send("&wCreating a new user account...\r\n"
///        + "Please enter a password for your account: ");
      this.myStage = AuthProcessor.stage.NEW_PASSWORD;
    }
  }

  protected checkPassword(password: string)
  {
    let accountManager = Server.accountManager;

    ASSERT_FATAL(this.myPlayerConnection.id != null,
      "Invalid socket descriptor id");

    // If password doesn't check, logIn returns "".
    let accountId =
      accountManager.logIn(
        this.myAccountName,
        password,
        this.myPlayerConnection.id);

    if (accountId !== null)
    {
      this.myPlayerConnection.accountId = accountId;
      this.myStage = AuthProcessor.stage.DONE;
      this.myPlayerConnection.enterLobby();
    }
    else
    {
      this.myPlayerConnection.send(
        "&wWrong password.\r\n"
        + "Password: ");

      // Here we don't advance the stage so the next user input will trigger
      // a checkPassword() again.
    }
  }

  protected getNewPassword(password: string)
  {
    if (!this.isPasswordValid(password))
      // We don't advance the stage so the next user input will trigger
      // a getNewPassword() again.
      return;

    // Pozn: O znovuzadani hesla nema smysl zadat, kdyz ho uzivatel
    // pri zadavani normalne vidi. (Asi by to ale chtelo implementovat
    // password reset s poslanim noveho hesla na mail).

    let newAccountId =
      Server.accountManager.createNewAccount(
        this.myAccountName,
        password,
        this.myPlayerConnection.id);

    this.myPlayerConnection.accountId = newAccountId;
    this.myStage = AuthProcessor.stage.DONE;
    this.myPlayerConnection.enterLobby();
  }

  // ----------- Auxiliary private methods --------------

  private isAccountNameValid(accountName: string): boolean
  {
    if (!accountName)
    {
      this.myPlayerConnection.send(
        "&wYou really need to enter a name to log in, sorry.\r\n"
        + "Please enter a valid name: ");
      /// Account name variant:
      ///      this.myPlayerConnection.send(
      ///        "&wYou really need to enter an account name to log in, sorry.\r\n"
      ///        + "Please enter valid account name: ");

      return false;
    }

    // Only letters for now.
    let regExp = /[^A-Za-z]/;

    /// Account name variant:
    // This regexp will evaluate as true if tested string contains any
    // non-alphanumeric characters.
    ///    let regExp = /[^A-Za-z0-9]/;

    if (regExp.test(accountName) === true)
    {
      this.myPlayerConnection.send(
        "&wName can only contain english letters and numbers.\r\n"
        + "Please enter a valid name: ");
   /// Account name variant:
   ///      this.myPlayerConnection.send(
   ///        "&wAccount name can only contain english letters and numbers.\r\n"
   ///        + "Please enter valid account name: ");

      return false;
    }

    const MAX_ACCOUNT_NAME_LENGTH = 12;
    /// Account name variant
    ///    const MAX_ACCOUNT_NAME_LENGTH = 20;

    if (accountName.length > MAX_ACCOUNT_NAME_LENGTH)
    {
      this.myPlayerConnection.send(
        "&wCould you please pick something shorter,"
        + " like up to " + MAX_ACCOUNT_NAME_LENGTH + " characters?.\r\n"
        + "Please enter a valid name: ");
      /// Account name variant
      ///      + "Please enter valid account name: ");

      return false;
    }

    const MIN_ACCOUNT_NAME_LENGTH = 2;

    if (accountName.length < MIN_ACCOUNT_NAME_LENGTH)
    {
      this.myPlayerConnection.send(
        "&wCould you please pick a name that is at least "
        + MIN_ACCOUNT_NAME_LENGTH + " characters long?.\r\n"
        + "Please enter a valid name: ");
      /// Account name variant
      ///      + "Please enter valid account name: ");

      return false;
    }

    return true;
  }

  private isPasswordValid(password: string): boolean
  {
    if (!password)
    {
      this.myPlayerConnection.send(
        "&wYou really need to enter a password, sorry.\r\n"
        + "Please enter a valid password: ");

      return false;
    }

    const MIN_PASSWORD_LENGTH = 4;

    if (password.length < MIN_PASSWORD_LENGTH)
    {
      this.myPlayerConnection.send(
        "&wDo you know the joke about passwords needing to be at least "
        + MIN_PASSWORD_LENGTH + " characters long?\r\n"
        + "Please enter a valid password: ");

      return false;
    }

    return true;
  }
}