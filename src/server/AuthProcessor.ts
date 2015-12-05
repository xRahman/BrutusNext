/*
  Part of BrutusNEXT

  Handles user authentication.
*/

import {ASSERT} from '../shared/ASSERT';
import {SocketDescriptor} from '../server/SocketDescriptor';
import {GameServer} from '../server/GameServer';
import {AccountManager} from '../server/AccountManager';

export class AuthProcessor
{
  constructor(protected mySocketDescriptor: SocketDescriptor) {}

  // ---------------- Public methods --------------------

  public processCommand(command: string)
  {
    /// TODO
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
    this.mySocketDescriptor.send("Welcome to the BrutusNext!\r\n"
      + "By what account name do you want to be recognized? ");

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
    // This regexp will evaluate as true if tested string contains any
    // non-alphanumeric characters.
    let regExp = /[^A-Za-z0-9]/;

    if (!accountName)
    {
      this.mySocketDescriptor.send(
        "\r\nYou really need to enter an account name to log in, sorry.\r\n"
        + "Please enter valid account name: ");

      // We don't advance the stage so the next user input will trigger
      // a loginAttempt() again.
      return;
    }

    if (regExp.test(accountName) === true)
    {
      this.mySocketDescriptor.send(
        "\r\nAccount name can only contain english letters and numbers.\r\n"
        + "Please enter valid account name: ");

      // We don't advance the stage so the next user input will trigger
      // a loginAttempt() again.
      return;
    }

    if (accountName.length > 20)
    {
      this.mySocketDescriptor.send(
        "\r\nCould you please pick something shorter,"
        + " like up to 20 characters?.\r\n"
        + "Please enter valid account name: ");

      // We don't advance the stage so the next user input will trigger
      // a loginAttempt() again.
      return;
    }

    // Make the first lettler uppercase and the rest lowercase.
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
    } else
    {
      // New user. Ask for a new password.
      this.mySocketDescriptor.send("Creating a new user account...\r\n"
        + "Please enter a password for your account: ");
      this.myStage = AuthProcessor.stage.NEW_PASSWORD;
    }
  }

  protected checkPassword(password: string)
  {
    let accountManager = GameServer.getInstance().accountManager;

    if (accountManager.logIn(this.myAccountName, password))
    {
      this.myStage = AuthProcessor.stage.DONE;
    }
  }

  protected getNewPassword(password: string)
  {
    let accountManager = GameServer.getInstance().accountManager;

    /// TODO: Check for password sanity.

    if (accountManager.logIn(this.myAccountName, password))
    {
      this.myStage = AuthProcessor.stage.DONE;
    }
  }
}