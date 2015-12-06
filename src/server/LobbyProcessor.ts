/*
  Part of BrutusNEXT

  Handles user lobby.
*/

import {ASSERT} from '../shared/ASSERT';
import {SocketDescriptor} from '../server/SocketDescriptor';
///import {GameServer} from '../server/GameServer';
///import {AccountManager} from '../server/AccountManager';

const GAME_MENU =
    "\r\nWelcome to BRUTUS Next!\r\n"
  + "\r\n"
  + "0) Exit from BRUTUS Next.\r\n"
  + "1) Enter the game.\r\n"
  + "\r\n"
  + "Make your choice: ";

export class LobbyProcessor
{
  constructor(protected mySocketDescriptor: SocketDescriptor) { }

  // ---------------- Public methods --------------------

  public enterMenu()
  {
    ASSERT(this.myStage === LobbyProcessor.stage.INITIAL
        || this.myStage === LobbyProcessor.stage.NOT_IN_LOBBY,
      "Entering game menu from invalid lobby stage");

    this.myStage = LobbyProcessor.stage.IN_MENU;
    this.sendMenu();
  }

  public processCommand(command: string)
  {
    switch (this.myStage)
    {
      case LobbyProcessor.stage.INITIAL:
        ASSERT(false, "LobbyProcessor has not yet been initialized, it is not"
          + " supposed to process any commands yet");
        break;
      case LobbyProcessor.stage.IN_MENU:
        this.processMenuChoice(command);
        break;
       case LobbyProcessor.stage.NOT_IN_LOBBY:
        ASSERT(false, "LobbyProcessor is not supposed to process any commands"
          + " when user is not in lobby");
        break;
      default:
        ASSERT(false, "Unknown stage");
        break;
    }
  }

  // -------------- Protected class data ----------------

  protected static stage =
  {
    INITIAL: 0, // Initial stage.
    IN_MENU: 1,
    NOT_IN_LOBBY: 2
  }

  protected myStage = LobbyProcessor.stage.INITIAL;

///  protected myAccountName = "";

  // --------------- Protected methods ------------------

  protected sendMenu()
  {
    this.mySocketDescriptor.send(GAME_MENU);
  }

  protected processMenuChoice(choice: string)
  {
    switch (choice)
    {
      case "0": // Quit the game.
        this.mySocketDescriptor.send(
          "Goodbye.\r\n"
          + "Have a nice day...");

        this.myStage = LobbyProcessor.stage.NOT_IN_LOBBY;

        /// TODO: close the connection
        /// TODO: delete online account
        break;
      case "1": // Enter the game.
        this.myStage = LobbyProcessor.stage.NOT_IN_LOBBY;
        // For now there can only be one character per account
        // so we don't need to present choice which one to log in with.
        // Entering game currently means logging in with the character
        // associated to the account.
        /// TODO

        break;
      default:
        this.mySocketDescriptor.send("That's not a menu choice!");
        this.sendMenu();
        break;
    }
  }
}
