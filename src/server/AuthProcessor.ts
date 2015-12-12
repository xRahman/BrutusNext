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

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {SocketDescriptor} from '../server/SocketDescriptor';
import {GameServer} from '../server/GameServer';
import {AccountManager} from '../server/AccountManager';

export class AuthProcessor
{
  // In this special case it's ok to hold direct reference to
  // SocketDescriptor, because our instance of AuthProcessor
  // is owned by the very SocketDescriptor we are storing reference
  // of here. In any other case, unique stringId of SocketDescriptor (within
  // DescriptorManager) needs to be used instead of a direct reference!
  constructor(protected mySocketDescriptor: SocketDescriptor) {}

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
    this.mySocketDescriptor.send("&GWelcome to &RBrutus &YNext!\r\n&w"
      + "By what name do you wish to be known? ");

/// Account name variant:
///    this.mySocketDescriptor.send("&GWelcome to the &RBrutus &YNext!\r\n"
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
    // Only letters for now.
    let regExp = /[^A-Za-z]/;

/// Account name variant:
    // This regexp will evaluate as true if tested string contains any
    // non-alphanumeric characters.
///    let regExp = /[^A-Za-z0-9]/;

    if (!accountName)
    {
      this.mySocketDescriptor.send(
        "You really need to enter a name to log in, sorry.\r\n"
        + "Please enter a valid name: ");
/// Account name variant:
///      this.mySocketDescriptor.send(
///        "You really need to enter an account name to log in, sorry.\r\n"
///        + "Please enter valid account name: ");

      // We don't advance the stage so the next user input will trigger
      // a loginAttempt() again.
      return;
    }

    if (regExp.test(accountName) === true)
    {
      this.mySocketDescriptor.send(
        "Name can only contain english letters and numbers.\r\n"
        + "Please enter a valid name: ");
/// Account name variant:
///      this.mySocketDescriptor.send(
///        "Account name can only contain english letters and numbers.\r\n"
///        + "Please enter valid account name: ");

      // We don't advance the stage so the next user input will trigger
      // a loginAttempt() again.
      return;
    }

    const MAX_ACCOUNT_NAME_LENGTH = 12;
/// Account name variant
///    const MAX_ACCOUNT_NAME_LENGTH = 20;

    if (accountName.length > MAX_ACCOUNT_NAME_LENGTH)
    {
      this.mySocketDescriptor.send(
        "Could you please pick something shorter,"
        + " like up to " + MAX_ACCOUNT_NAME_LENGTH + " characters?.\r\n"
        + "Please enter a valid name: ");
/// Account name variant
///      + "Please enter valid account name: ");

      // We don't advance the stage so the next user input will trigger
      // a loginAttempt() again.
      return;
    }

    const MIN_ACCOUNT_NAME_LENGTH = 2;

    if (accountName.length < MIN_ACCOUNT_NAME_LENGTH)
    {
      this.mySocketDescriptor.send(
        "Could you please pick a name that is at least "
        + MIN_ACCOUNT_NAME_LENGTH + " characters long?.\r\n"
        + "Please enter a valid name: ");
      /// Account name variant
      ///      + "Please enter valid account name: ");

      // We don't advance the stage so the next user input will trigger
      // a loginAttempt() again.
      return;
    }

    // Make the first letter uppercase and the rest lowercase.
    accountName = accountName[0].toUpperCase()
      + accountName.toLowerCase().substr(1);

    // Remember final account name because nobody else is going to do it.
    this.myAccountName = accountName;

    let accountManager = GameServer.getInstance().accountManager;

    // We are not going to log in or create a new account just yet,
    // we will wait for a password.
    if (accountManager.exists(accountName))
    {
      // Existing user. Ask for password.
      this.mySocketDescriptor.send("Password: ");
      this.myStage = AuthProcessor.stage.PASSWORD;
    }
    else
    {
      // New user. Ask for a new password.
      this.mySocketDescriptor.send("Creating a new character...\r\n"
        + "Please enter a password you want to use to log in: ");
/// Account name variant
///      this.mySocketDescriptor.send("Creating a new user account...\r\n"
///        + "Please enter a password for your account: ");
      this.myStage = AuthProcessor.stage.NEW_PASSWORD;
    }
  }

  protected checkPassword(password: string)
  {
    let accountManager = GameServer.getInstance().accountManager;

    ASSERT_FATAL(this.mySocketDescriptor.id != null,
      "Invalid socket descriptor id");

    // If password doesn't check, logIn returns "".
    let accountId =
      accountManager.logIn(
        this.myAccountName,
        password,
        this.mySocketDescriptor.id);

    if (accountId !== null)
    {
      this.mySocketDescriptor.accountId = accountId;

      this.myStage = AuthProcessor.stage.DONE;

      this.mySocketDescriptor.enterLobby();
    }
    else
    {
      this.mySocketDescriptor.send(
        "Wrong password.\r\n"
        + "Password: ");

      // Here we don't advance the stage so the next user input will trigger
      // a checkPassword() again.
    }
  }

  protected getNewPassword(password: string)
  {
    let accountManager = GameServer.getInstance().accountManager;

    if (!password)
    {
      this.mySocketDescriptor.send(
        "You really need to enter a password, sorry.\r\n"
        + "Please enter a valid password: ");

      // We don't advance the stage so the next user input will trigger
      // a getNewPassword() again.
      return;
    }

    const MIN_PASSWORD_LENGTH = 4;

    if (password.length < MIN_PASSWORD_LENGTH)
    {
      this.mySocketDescriptor.send(
        "Do you know the joke about passwords needing to be at least "
        + MIN_PASSWORD_LENGTH + " characters long?\r\n"
        + "Please enter a valid password: ");

      // We don't advance the stage so the next user input will trigger
      // a getNewPassword() again.
      return;
    }

    // Pozn: O znovuzadani hesla nema smysl zadat, kdyz ho uzivatel
    // pri zadavani normalne vidi. (Asi by to ale chtelo implementovat
    // password reset s poslanim noveho hesla na mail).

    let newAccountId =
      accountManager.createNewAccount(
        this.myAccountName,
        password,
        this.mySocketDescriptor.id);

    this.mySocketDescriptor.accountId = newAccountId;

    this.myStage = AuthProcessor.stage.DONE;

    this.mySocketDescriptor.enterLobby();
  }
}