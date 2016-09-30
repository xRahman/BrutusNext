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

import {ERROR} from '../../shared/error/ERROR';
import {Utils} from '../../shared/Utils';
import {EntityManager} from '../../shared/entity/EntityManager';
import {Syslog} from '../../server/Syslog';
import {AdminLevel} from '../../server/AdminLevel';
import {Message} from '../../server/message/Message';
import {Connection} from '../../server/connection/Connection';
import {Server} from '../../server/Server';
import {Account} from '../../server/account/Account';
import {AccountList} from '../../server/account/AccountList';

export class AuthProcessor
{
  public static get MAX_ACCOUNT_NAME_LENGTH() { return 12; }
  public static get MIN_ACCOUNT_NAME_LENGTH() { return 2; }

  constructor(protected connection: Connection) { }

  //------------------ Private data ---------------------

  private stage = AuthProcessor.Stage.INITIAL;
  private accountName = "";

  // ---------------- Public methods --------------------

  public getAccountName() { return this.accountName; }

  public async processCommand(command: string)
  {
    switch (this.stage)
    {
      case AuthProcessor.Stage.INITIAL:
        ERROR("AuthProcessor has not yet been initialized, it is not"
          + " supposed to process any commands yet");
      break;

      case AuthProcessor.Stage.LOGIN:
        this.loginAttempt(command);
      break;

      case AuthProcessor.Stage.PASSWORD:
        ///// DEBUG:
        //console.log("AuthProcessor.stage.PASSWORD");
        //process.exit(1);
        await this.checkPassword(command);
      break;

      case AuthProcessor.Stage.NEW_PASSWORD:
        ///// DEBUG:
        //console.log("AuthProcessor.stage.NEW_PASSWORD");
        //process.exit(1);
        this.getNewPassword(command); 
      break;

      case AuthProcessor.Stage.DONE:
        ERROR("AuthProcessor has already done it's job, it is not"
          + " supposed to process any more commands");
      break;

      default:
        ERROR("Unknown stage: " + this.stage);
      break;
    }
  }

  public startLoginProcess()
  {
    // Note: We are intentionally overriding default base color
    // for AUTH_PROMPT messages here with '&g' at the start of
    // the string.
    this.sendAuthPrompt
    (
      "&gWelcome to the &RBrutus &YNext!\n"
      + "&wBy what account name do you want to be recognized?"
    );

    this.stage = AuthProcessor.Stage.LOGIN;
  }

  // --------------- Private methods --------------------

  private loginAttempt(accountName: string)
  {
    if (!this.isAccountNameValid(accountName))
      // We don't advance the stage so the next user input will trigger
      // a loginAttempt() again.
      return;

    // Make the first letter uppercase and the rest lowercase.
    accountName = Utils.upperCaseFirstCharacter(accountName);

    // We are not going to attempt to log in to this account untill we receive
    // password so we need to remember account name until then.
    this.accountName = accountName;

    if (Server.accounts.exists(accountName))
    {
      // Existing user. Ask for password.
      this.sendAuthPrompt("Password:");
      this.stage = AuthProcessor.Stage.PASSWORD;
    }
    else
    {
      // New user. Ask for a new password.
      this.sendAuthPrompt("Creating a new user account...\n"
        + "Please enter a password for your account:");
      this.stage = AuthProcessor.Stage.NEW_PASSWORD;
    }
  }

  private async checkPassword(password: string)
  {
    let accountManager = Server.accounts;

    if (this.connection === null)
    {
      ERROR("Invalid connection in account " + this.accountName
        + " Aborting checkPassword()");
      return;
    }

    if (this.connection.getId() === null)
    {
      ERROR("Invalid player connection id in account " + this.accountName
        + " Aborting checkPassword()");
      return;
    }

    // Check if account info is already loaded.
    let account = accountManager.getAccountByName(this.accountName);

    if (account)
    {
      this.processPasswordCheck(account, password, { reconnecting: true });
    }
    else
    {
      account = EntityManager.createNamedEntity
      (
        this.accountName,
        'Account',
        Account
      );
      account.connection = this.connection;

      // Account name is passed to check against character name saved
      // in file (they must by the same).
      await this.loadAccount(account, this.accountName);

      this.processPasswordCheck(account, password, { reconnecting: false });
    }
  }

  private getNewPassword(password: string)
  {
    if (this.connection === null)
    {
      ERROR("Null conection on account " + this.accountName + "."
        + " Password is not processed");
      return;
    }

    if (!this.isPasswordValid(password))
      // We don't advance the stage so the next user input will trigger
      // a getNewPassword() again.
      return;

    // Note:
    //   There is no point in asking user to retype the password when
    // she can see it typed (which is the only option when using telnet).

    // Password accepted, create a new account.
    let account = Server.accounts.createAccount
    (
      this.accountName,
      password,
      this.connection
    );

    if (account === null)
      // We don't advance the stage so the next user input will trigger
      // a getNewPassword() again.
      // (error message is already handled by createAccount())
      return;

    Syslog.log
    (
      "New player: " + this.accountName
      + " [" + this.connection.ipAddress + "]",
      Message.Type.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    this.connection.account = account;
    this.updateLoginInfo();
    this.stage = AuthProcessor.Stage.DONE;
    this.connection.enterLobby();
    this.connection.sendMotd({ withPrompt: true });
  }

  private isAccountNameValid(accountName: string): boolean
  {
    if (!accountName)
    {
      this.sendAuthPrompt
      (
        "You really need to enter an account name to log in, sorry.\n"
        + "Please enter a valid name:"
      );

      return false;
    }

    // Only letters for now.
    let regExp = /[^A-Za-z]/;

    /// 'numbers allowed' variant:
    // This regexp will evaluate as true if tested string contains any
    // non-alphanumeric characters.
    ///    let regExp = /[^A-Za-z0-9]/;

    if (regExp.test(accountName) === true)
    {
      this.sendAuthPrompt
      (
        "Account name can only contain english letters.\n"
        + "Please enter a valid account name:"
      );

      return false;
    }

    if (accountName.length > AuthProcessor.MAX_ACCOUNT_NAME_LENGTH)
    {
      this.sendAuthPrompt
      (
        "Please pick something up to " + AuthProcessor.MAX_ACCOUNT_NAME_LENGTH
        + " characters.\n"
        + "Enter a valid account name:"
      );

      return false;
    }

    if (accountName.length < AuthProcessor.MIN_ACCOUNT_NAME_LENGTH)
    {
      this.sendAuthPrompt
      (
        "Could you please pick a name that is at least"
        + " " + AuthProcessor.MIN_ACCOUNT_NAME_LENGTH
        + " characters long?\n"
        + "Enter a valid account name: "
      );

      return false;
    }

    return true;
  }

  private isPasswordValid(password: string): boolean
  {
    if (!password)
    {
      this.sendAuthPrompt
      (
        "You really need to enter a password, sorry.\n"
        + "Please enter a valid password:"
      );

      return false;
    }

    const MIN_PASSWORD_LENGTH = 4;

    if (password.length < MIN_PASSWORD_LENGTH)
    {
      this.sendAuthPrompt
      (
        "Do you know the joke about passwords needing to be at least "
        + MIN_PASSWORD_LENGTH + " characters long?\n"
        + "Enter a valid password:"
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
    // Asynchronous reading from file.
    // (the rest of the code will execute only after the reading is done)
    await account.load();

    if (account.getId() === null)
    {
      ERROR("Null id in saved file of account " + account.name
        + " Aborting loadAccount()");
      account = null;
      return;
    }

    if (this.accountName !== account.name)
    {
      ERROR("Account name saved in file (" + account.name + ")"
        + " doesn't match account file name (" + this.accountName + ")."
        + " Renaming account to match file name");
    
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
    let accountManager = Server.accounts;

    if (account.checkPassword(password))
    {
      // Password checks so we are done with authenticating.
      this.stage = AuthProcessor.Stage.DONE;

      // Structured parameters is used instead of simple bool to enforce
      // more verbosity when calling processPasswordCheck().
      if (param.reconnecting)
      {
        this.connection.reconnectToAccount(account);
      }
      else
      {
        // Add newly loaded account to accountManager (under it's original id).
        accountManager.add(account);

        this.connection.connectToAccount(account);
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
    Syslog.log
    (
      "Bad PW: " + this.accountName
      + " [" + this.connection.ipAddress + "]",
      Message.Type.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    this.sendAuthPrompt
    (
      "Wrong password.\n"
      + "Password: "
    );
  }

  // Sends a login info (motd, last login, etc.).
  private sendLoginInfo()
  {
    this.connection.sendMotd({ withPrompt: false });
    this.connection.sendLastLoginInfo();
  }

  // Updates login info to current values.
  private updateLoginInfo()
  {
    this.connection.account.updateLastLoginInfo();
  }

  private sendAuthPrompt(text: string)
  {
    let message = new Message(Message.Type.AUTH_PROMPT, text);

    // There is no applicable sender, so the first parameter is null.
    message.sendToConnection(null, this.connection);
  }
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module AuthProcessor
{
  export enum Stage
  {
    INITIAL, // Initial stage.
    LOGIN,
    PASSWORD,
    NEW_PASSWORD,
    DONE
  }
}