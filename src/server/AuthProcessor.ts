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

 // Problem je, ze pres telnet se nic jineho posilat neda. Zatim me napada
 // jedine reseni: Svazat account s mailovou adresou a posilat jednorazove
 // "heslo" pokazde, kdyz se chce hrac lognout. Pripadne pridat moznost
 // lognout zapamatovat si ipcko a povolit z nej logovat bez hesla, aby to
 // nebyla takova pruda.

 // BTW pouzivat mailovou adresu jako account name neni dobry napad, protoze
 // by se stejne jako heslo posilala nezakryptovane, tzn. by ji nekdo mohl
 // takhle zjistit a bud zkouset hacknout, nebo alespon otravovat password
 // resetama.

  Ted to kazdopadne resit nebudu.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Mudlog} from '../server/Mudlog';
import {AdminLevels} from '../server/AdminLevels';
import {PlayerConnection} from '../server/PlayerConnection';
import {Server} from '../server/Server';
import {Account} from '../server/Account';
import {AccountManager} from '../server/AccountManager';

export class AuthProcessor
{
  // In this special case it's ok to hold direct reference to
  // PlayerConnection, because instance of AuthProcessor
  // is owned by the very PlayerConnection we are storing reference
  // of here. In any other case, unique stringId of PlayerConnection (within
  // PlayerConnectionManager) needs to be used instead of a direct reference!
  constructor(protected playerConnection: PlayerConnection) { }

  public static get MAX_ACCOUNT_NAME_LENGTH() { return 12; }
  public static get MIN_ACCOUNT_NAME_LENGTH() { return 2; }

  // ---------------- Public methods --------------------

  public getAccountName() { return this.accountName; }

  public async processCommand(command: string)
  {
    switch (this.stage)
    {
      case AuthProcessor.stage.INITIAL:
        ASSERT(false, "AuthProcessor has not yet been initialized, it is not"
          + " supposed to process any commands yet");
      break;

      case AuthProcessor.stage.LOGIN:
        this.loginAttempt(command);
      break;

      case AuthProcessor.stage.PASSWORD:
        await this.checkPassword(command);
      break;

      case AuthProcessor.stage.NEW_PASSWORD:
        this.getNewPassword(command);
      break;

      case AuthProcessor.stage.DONE:
        ASSERT(false, "AuthProcessor has already done it's job, it is not"
          + " supposed to process any more commands");
      break;

      default:
        ASSERT(false, "Unknown stage: " + this.stage);
      break;
    }
  }

  public startLoginProcess()
  {
    this.playerConnection.sendAsPrompt("&gWelcome to &RBrutus &YNext!\n"
      + "&wBy what name do you wish to be known? ");

/// Account name variant:
///    this.playerConnection.send("&gWelcome to the &RBrutus &YNext!\n"
///      + "By what account name do you want to be recognized? ");

    this.stage = AuthProcessor.stage.LOGIN;
  }

  // -------------- Protected class data ----------------

  protected static stage =
  {
    INITIAL: 'INITIAL', // Initial stage.
    LOGIN: 'LOGIN',
    PASSWORD: 'PASSWORD',
    NEW_PASSWORD: 'NEW_PASSWORD',
    DONE: 'DONE'
  }

  protected stage = AuthProcessor.stage.INITIAL;

  protected accountName = "";

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
    this.accountName = accountName;

    if (Server.accountManager.accountExists(accountName))
    {
      // Existing user. Ask for password.
      this.playerConnection.sendAsPrompt("&wPassword: ");
      this.stage = AuthProcessor.stage.PASSWORD;
    }
    else
    {
      // New user. Ask for a new password.
      this.playerConnection.sendAsPrompt("&wCreating a new character...\n"
        + "Please enter a password you want to use: ");
/// Account name variant
///      this.playerConnection.send("&wCreating a new user account...\n"
///        + "Please enter a password for your account: ");
      this.stage = AuthProcessor.stage.NEW_PASSWORD;
    }
  }

  protected async checkPassword(password: string)
  {
    let accountManager = Server.accountManager;

    ASSERT_FATAL(this.playerConnection.getId() != null,
      "Invalid player connection id");

    // Check if account info is already loaded.
    let account = accountManager.getAccountByName(this.accountName);

    if (account)
    {
      this.processPasswordCheck(account, password, { reconnecting: true });
    }
    else
    {
      account = new Account(this.accountName, this.playerConnection.getId());

      // Account name is passed to check against character name saved
      // in file (they must by the same).
      await this.loadAccount(account, this.accountName);

      this.processPasswordCheck(account, password, { reconnecting: false });
    }
  }

  protected getNewPassword(password: string)
  {
    if (!this.isPasswordValid(password))
      // We don't advance the stage so the next user input will trigger
      // a getNewPassword() again.
      return;

    // Note:
    //   There is no point in asking user to retype the password when
    // she can see it typed (which is the only option when using telnet).

    // Password accepted, create a new account.
    let newAccountId =
      Server.accountManager.createAccount
      (
        this.accountName,
        password,
        this.playerConnection.getId()
      );

    Mudlog.log
    (
      "New player: " + this.accountName
      + " [" + this.playerConnection.ipAddress + "]",
      Mudlog.msgType.SYSTEM_INFO,
      AdminLevels.IMMORTAL
    );

    this.playerConnection.accountId = newAccountId;
    this.updateLoginInfo();
    this.stage = AuthProcessor.stage.DONE;
    this.playerConnection.enterLobby();
    this.playerConnection.sendMotd({ withPrompt: true });
  }

  // ----------- Auxiliary private methods --------------

  private isAccountNameValid(accountName: string): boolean
  {
    if (!accountName)
    {
      this.playerConnection.sendAsPrompt
      (
        "&wYou really need to enter a name to log in, sorry.\n"
        + "Please enter a valid name: "
      );
      /// Account name variant:
      ///      this.playerConnection.send(
      ///        "&wYou really need to enter an account name to log in, sorry.\n"
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
      this.playerConnection.sendAsPrompt
      (
        "&wName can only contain english letters.\n"
        + "Please enter a valid name: "
      );
   /// Account name variant:
   ///      this.playerConnection.send(
   ///        "&wAccount name can only contain english letters and numbers.\n"
   ///        + "Please enter valid account name: ");

      return false;
    }

    if (accountName.length > AuthProcessor.MAX_ACCOUNT_NAME_LENGTH)
    {
      this.playerConnection.sendAsPrompt
      (
        "&wCould you please pick something shorter, like up to "
        + AuthProcessor.MAX_ACCOUNT_NAME_LENGTH + " characters?\n"
        + "Please enter a valid name: "
      );
      /// Account name variant
      ///      + "Please enter valid account name: ");

      return false;
    }

    if (accountName.length < AuthProcessor.MIN_ACCOUNT_NAME_LENGTH)
    {
      this.playerConnection.sendAsPrompt
      (
        "&wCould you please pick a name that is at least "
        + AuthProcessor.MIN_ACCOUNT_NAME_LENGTH + " characters long?\n"
        + "Please enter a valid name: "
      );
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
      this.playerConnection.sendAsPrompt
      (
        "&wYou really need to enter a password, sorry.\n"
        + "Please enter a valid password: "
      );

      return false;
    }

    const MIN_PASSWORD_LENGTH = 4;

    if (password.length < MIN_PASSWORD_LENGTH)
    {
      this.playerConnection.sendAsPrompt
      (
        "&wDo you know the joke about passwords needing to be at least "
        + MIN_PASSWORD_LENGTH + " characters long?\n"
        + "Please enter a valid password: "
      );

      return false;
    }

    return true;
  }

  private async loadAccount
  (
    account: Account,
    accountFileName: string
  )
  {
    // Asynchronous reading from the file.
    // (the rest of the code will execute only after the reading is done)
    await account.load();

    ASSERT_FATAL(account.getId() !== null,
      "Null id in saved file of account: " + account.name);

    if (!ASSERT(this.accountName === account.name,
      "Account name saved in file (" + account.name + ")"
      + " doesn't match account file name (" + this.accountName + ")."
      + " Renaming account to match file name."))
    {
      account.name = this.accountName;
    }
  }

  // Check password agains that stored in account, advances stage
  // appropriately.
  private processPasswordCheck
  (
    account: Account,
    password: string,
    param: { reconnecting: boolean }
  )
  {
    let accountManager = Server.accountManager;

    if (account.checkPassword(password))
    {
      // Password checks so we are done with authenticating.
      this.stage = AuthProcessor.stage.DONE;

      // Structured parameters is used instead of simple bool to enforce
      // more verbosity when calling processPasswordCheck().
      if (param.reconnecting)
      {
        this.playerConnection.reconnectToAccount(account);
      }
      else
      {
        // Add newly loaded account to accountManager (under it's original id).
        accountManager.registerLoadedAccount(account);

        this.playerConnection.connectToAccount(account);
      }

      this.sendLoginInfo();
      this.updateLoginInfo();
    }
    else
    {
      this.announcePasswordFailure();

      // Here we don't advance the stage so the next user input will trigger
      // a checkPassword() again.
    }
  }

  private announcePasswordFailure()
  {
    Mudlog.log
    (
      "Bad PW: " + this.accountName
      + " [" + this.playerConnection.ipAddress + "]",
      Mudlog.msgType.SYSTEM_INFO,
      AdminLevels.IMMORTAL
    );

    this.playerConnection.sendAsPrompt
    (
      "&wWrong password.\n"
      + "Password: "
    );
  }

  // Sends a login info (motd, last login, etc.).
  private sendLoginInfo()
  {
    this.playerConnection.sendMotd({ withPrompt: false });
    this.playerConnection.sendLastLoginInfo();
  }

  // Updates login info to current values.
  private updateLoginInfo()
  {
    this.playerConnection.account.updateLastLoginInfo();
  }
}