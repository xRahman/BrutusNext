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

  private stage = null;
  private accountName = "";

  // ---------------- Public methods --------------------

  public getAccountName() { return this.accountName; }

  public async processCommand(command: string)
  {
    switch (this.stage)
    {
      case null:
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

      case AuthProcessor.Stage.MOTD:
        // Any command (including just pressing enter)
        // will carry us on to the next stage.
        this.acceptMotd();
        break;

      default:
        ERROR("Unknown stage: " + this.stage);
        break;
    }
  }

  public startAuthenticating()
  {
    // We are intentionally overriding default base color
    // for AUTH_PROMPT messages here with '&g' at the start
    // of the string.

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

    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection in account " + this.accountName
        + " Aborting checkPassword()");
      return;
    }

    // Check if account info is already loaded.
    // (getAccountByName() returns 'undefined' if account isn't loaded in memory) 
    let account = accountManager.getAccountByName(this.accountName);

    if (account !== undefined)
    {
      this.processPasswordCheck(account, password, { reconnecting: true });
    }
    else
    {
      // Account name is passed to check against character name saved
      // in file (they must by the same).
      // (Parameter 'account' will be changed as side effect)
      await this.loadAccount(account, this.accountName);

      if (account === null || account === undefined || account.isValid() === false)
        // Error is already reported by loadAcccount().
        return;

      this.processPasswordCheck(account, password, { reconnecting: false });
    }
  }

  private acceptNewPassword(password: string): boolean
  {
    if (this.connection === null)
    {
      ERROR("Null conection on account " + this.accountName + "."
        + " Password is not processed");
      return false;
    }

    return this.isPasswordValid(password);
  }

  private createAccount(password: string): Account
  {
    let account = Server.accounts.createAccount
    (
      this.accountName,
      password,
      this.connection
    );

    this.connection.account = account;

    return account;
  }

  private announceNewPlayer()
  {
    Syslog.log
    (
      "New player: " + this.accountName
      + " [" + this.connection.ipAddress + "]",
      Message.Type.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );
  }

  private getNewPassword(password: string)
  {
    if (this.acceptNewPassword(password) === false)
    {
      // We don't advance this.stage so the next user input will trigger
      // a getNewPassword() again.
      return;
    }

    // Password accepted, create a new account.
    let account = this.createAccount(password);

    if (account === null)
      // We don't advance the stage so the next user input will trigger
      // a getNewPassword() again.
      // (error message is already handled by createAccount())
      return;

    this.announceNewPlayer();

    // Parameter 'newAccount' set to 'true' means that lastLoginInfo will
    // not be sent (it doesn't make sense for freshly created account). 
    this.sendLoginInfo({ newAccount: true });

    // Updates login info to current values.
    account.updateLastLoginInfo();

    // Stage MOTD will just wait for any command to proceed to the menu. 
    this.stage = AuthProcessor.Stage.MOTD;
  }

  private acceptMotd()
  {
    this.connection.finishAuthenticating();
    this.connection.enterLobby();
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
    // Parameter 'account' is changed as side effect.
    // (because async methods can't return value)
    account: Account,
    accountFileName: string
  )
  {
    /*
    /// TODO: Tady se nesmí volat createNamedEntity(), musí se volat
    ///   něco, co vytvoří invalid referenci s prázdným idčkem (protože
    ///   idčko se musí loadnou ze souboru. 
    account = EntityManager.createNamedEntity
    (
      this.accountName,
      'Account',
      Account
    );
    */
    account = EntityManager.createReference(null, 'Account', Account);

    // Asynchronous reading from file.
    // (the rest of the code will execute only after the reading is done)
    await account.load();

    if (account === null || account === undefined || account.isValid() === false)
    {
      ERROR("Failed to load account " + account.name);
      account = null;
      return;
    }

    account.connection = this.connection;

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
    if (account === null || account === undefined || account.isValid() === false)
    {
      ERROR("Invalid account");
      return;
    }

    if (account.checkPassword(password) === true)
    {
      if (param.reconnecting === true)
      {
        this.connection.reconnectToAccount(account);
      }
      else
      {
        let accountManager = Server.accounts;

        // Add newly loaded account to accountManager (under it's original id).
        accountManager.add(account);

        this.connection.connectToAccount(account);
      }

      // Parameter 'newAccount' set to 'false' means that lastLoginInfo will be sent. 
      this.sendLoginInfo({ newAccount: false });

      // This must be done after login info is sent
      // (so the previous values will be sent to player).
      account.updateLastLoginInfo();

      // Password checks so we are done with authenticating.
      this.connection.finishAuthenticating();
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

  // Last login info looks like:
  //
  // There was #377256 players since 3.1.2002
  //
  // Last login: localhost at Sat Apr 2 20:40:06 2016
  private getLastLoginInfo(): string
  {
    ///    let numberOfPlayersInfo =
    ///      "&wThere was #" + Server.getNumberOfPlayers()
    ///      + " players since &W3. 4. 2016";

    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection");
      return "<Error while retrieving last login info>";
    }

    let account = this.connection.account;

    if (account === null || account.isValid() === false)
    {
      ERROR("Invalid account");
      return "<Error while retrieving last login info>";
    }

    return "Last login: " + account.getLastLoginAddress()
         + " at " + account.getLastLoginDate();
  }

  // Sends a login info (motd, last login, etc.).
  private sendLoginInfo(param: { newAccount: boolean })
  {
    let loginInfo = Server.getMotd() + "\n";

    // Last login info is only send for existing accounts,
    // it doesn't make sense for a freshly created account.
    if (param.newAccount === false)
    {
      loginInfo += this.getLastLoginInfo() + "\n";
    }

    loginInfo += "*** PRESS RETURN:";

    Message.sendToConnection(loginInfo, Message.Type.LOGIN_INFO, this.connection);
  }

  private sendAuthPrompt(text: string)
  {
    Message.sendToConnection
    (
      text,
      Message.Type.AUTH_PROMPT,
      this.connection
    );
  }
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module AuthProcessor
{
  export enum Stage
  {
    LOGIN,
    PASSWORD,
    NEW_PASSWORD,
    MOTD
  }
}