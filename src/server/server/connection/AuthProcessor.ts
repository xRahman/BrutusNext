/*
  Part of BrutusNEXT

  Handles user authentication.
*/

/*
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

export class AuthProcessor
{
  public static get MAX_ACCOUNT_NAME_LENGTH() { return 12; }
  public static get MIN_ACCOUNT_NAME_LENGTH() { return 2; }

  constructor(protected connection: Connection) { }

  //------------------ Private data ---------------------

  private stage: AuthProcessor.Stage = null;
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
        await this.loginAttempt(command);
        break;

      case AuthProcessor.Stage.PASSWORD:
        await this.checkPassword(command);
        break;

      case AuthProcessor.Stage.NEW_PASSWORD:
        await this.newPassword(command);
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

  private async loginAttempt(accountName: string)
  {
    if (!this.isNameValid(accountName))
      // We don't advance the stage so the next user input will trigger
      // a loginAttempt() again.
      return;

    // Make the first letter uppercase and the rest lowercase.
    accountName = Utils.upperCaseFirstCharacter(accountName);

    // We are not going to attempt to log in to this account until we
    // receive password so we need to remember account name until then.
    this.accountName = accountName;

    if (await Server.accounts.exists(accountName))
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

      // We also need to prevent other players to create account
      // with the same name before our user enters her password.
      //   It's because the name lock file (which tells us that
      // a name is taken) is only created after we know the password.
      Server.accounts.setSoftNameLock(accountName);
    }
  }

  // -> Returns 'null' if account doesn't exist or can't be loaded.
  private async loadAccount(): Promise<Account>
  {
    // loadAccount() returns null if account doesn't exist on the disk.
    let account = await Server.accounts.loadAccount
    (
      this.accountName,
      this.connection
    );

    if (account === null || !account.isValid())
    {
      this.announceAccountLoadFailure();

      // There is no point in requesting password again
      // because the same error will probably occur again.
      // So we will just disconnect the player.
      this.connection.finishAuthenticating();
      this.connection.close();

      return null;
    }

    return account;
  }

  private async checkPassword(password: string)
  {
    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection in AuthProcessor when trying"
        + " to check password of account " + this.accountName);
      return;
    }

    // 'this.authenticate' returns 'null' if authentication
    // fails for any reason (password doesn't match or there
    // is some error). 
    let account = await this.authenticate(password);

    if (account === null)
      // We don't advance stage here.
      // - Either password didn't match and another
      //   pasword prompt has been sent to player.
      //   (in this case another user imput will
      //    trigger checkPassword() again)
      // - Or there was some serios error and player
      //   has been disconnected.
      return;

    // Sends login info (motd, last login, etc.). 
    this.sendLoginInfo(account, { sendLastLoginInfo: true });

    // Stage MOTD will wait for any command to proceed to the menu. 
    this.stage = AuthProcessor.Stage.MOTD;
  }

  private async createAccount(password: string): Promise<Account>
  {
    let account = await Server.accounts.createAccount
    (
      this.accountName,
      password,
      this.connection
    );

    // 'createAccount()' has created a name lock file, so we can
    // free soft lock on 'this.accountName'.
    Server.accounts.removeSoftNameLock(this.accountName);

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

  private async newPassword(password: string)
  {
    if (!this.isPasswordValid(password))
    {
      // We don't advance this.stage so the next user input will trigger
      // a getNewPassword() again.
      return;
    }

    // Password accepted, create a new account.
    let account = await this.createAccount(password);

    if (account === null)
      // We don't advance the stage so the next user input will trigger
      // a getNewPassword() again.
      // (error message is already handled by createAccount())
      return;

    this.announceNewPlayer();

    // LastLoginInfo (ip address and last login date will not
    // be sent (it doesn't make sense for freshly created account). 
    this.sendLoginInfo(account, { sendLastLoginInfo: false });

    // Stage MOTD will wait for any command to proceed to the menu. 
    this.stage = AuthProcessor.Stage.MOTD;
  }

  private acceptMotd()
  {
    this.connection.finishAuthenticating();
    this.connection.enterMenu();
  }

  private isNameValid(name: string): boolean
  {
    if (!name)
    {
      this.sendAuthPrompt
      (
        "You really need to enter an account name to log in, sorry.\n"
        + "Please enter a valid account name:"
      );

      return false;
    }

    // Only letters for now.
    let regExp = /[^A-Za-z]/;

    /// 'numbers allowed' variant:
    // This regexp will evaluate as true if tested string contains any
    // non-alphanumeric characters.
    ///    let regExp = /[^A-Za-z0-9]/;

    if (regExp.test(name) === true)
    {
      this.sendAuthPrompt
      (
        "Account name can only contain english letters.\n"
        + "Please enter a valid account name:"
      );

      return false;
    }

    if (name.length > AuthProcessor.MAX_ACCOUNT_NAME_LENGTH)
    {
      this.sendAuthPrompt
      (
        "Please pick something up to " + AuthProcessor.MAX_ACCOUNT_NAME_LENGTH
        + " characters.\n"
        + "Enter a valid account name:"
      );

      return false;
    }

    if (name.length < AuthProcessor.MIN_ACCOUNT_NAME_LENGTH)
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
    if (this.connection === null)
    {
      ERROR("Null conection on account " + this.accountName + "."
        + " Password is not processed");
      return false;
    }

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

  private connectToAccount(account: Account, reconnecting: boolean)
  {
    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection on account " + this.accountName);
      return;
    }
    
    if (reconnecting)
    {
      this.connection.reconnectToAccount(account);
    }
    else
    {
      if (Server.accounts === null)
      {
        ERROR("Invalid account manager");
        return;
      }

      this.connection.connectToAccount(account);
    }
  }

  // Finds user account or loads it from disk, checks if password match,
  // connects user to account on success.
  // -> Returns 'null' if password doesn't match or there is some error.    
  private async authenticate(password: string): Promise<Account>
  {
    let reconnecting = true;

    // Check if account is already loaded.
    // (getAccountByName() returns 'undefined' if account isn't in the manager) 
    let account = Server.accounts.getAccountByName(this.accountName);

    // If account doesn't exist in accountManager, we need to load it from
    // the disk.
    if (account === undefined)
    {
      account = await this.loadAccount();

      if (account === null)
        // Player got disconnected by LoadAccount(),
        // there is nothing more to do.      
        return null;

      reconnecting = false;
    }

    // Attempt to log into the account with a password. 
    if (!this.validatePassword(account, password))
      return null;

    this.connectToAccount(account, reconnecting);

    return account;
  }

  // Checks password against that stored in account.
  // -> Returns 'false' on failure.
  private validatePassword(account: Account, password: string)
  {
    if (account === null || account.isValid() === false)
    {
      ERROR("Invalid account");
      return false;
    }

    if (!account.checkPassword(password))
    {
      // Also sends another password prompt.
      this.announceWrongPassword();

      return false;
    }

    return true;
  }

  private announceWrongPassword()
  {
    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection on account " + this.accountName);
      return;
    }

    Syslog.log
    (
      "Bad PW: " + this.accountName
      + " [" + this.connection.ipAddress + "]",
      Message.Type.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );
 
    this.sendAuthPrompt
    (
      "Wrong password or account name.\n"
      + "Password: "
    );
  }

  private announceAccountLoadFailure()
  {
    // Let admins know what went wrong.
    Syslog.log
    (
      "Failed to load account " + this.accountName + "."
      + " Disconnecting player",
      Message.Type.SYSTEM_ERROR,
      AdminLevel.IMMORTAL
    );

    // Let the player know what went wrong.
    Message.sendToConnection
    (
      "Unable to load your account.\n"
        + Message.PLEASE_CONTACT_ADMINS,
      Message.Type.CONNECTION_ERROR,
      this.connection
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
      ERROR("Invalid connection on account " + this.accountName);
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

  // Sends login info (motd, last login, etc.),
  // advances the stage to AuthProcessor.Stage.MOTD.
  private sendLoginInfo
  (
    account: Account,
    param: { sendLastLoginInfo: boolean }
  )
  {
    let loginInfo = Server.getMotd() + "\n";

    // Last login info is only send for existing accounts,
    // it doesn't make sense for a freshly created account.
    if (param.sendLastLoginInfo === true)
      loginInfo += this.getLastLoginInfo() + "\n";

    loginInfo += "*** PRESS RETURN:";

    Message.sendToConnection
    (
      loginInfo,
      Message.Type.LOGIN_INFO,
      this.connection
    );

    // This must be done after login info is sent
    // (so the previous values will be sent to player).
    account.updateLastLoginInfo();
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