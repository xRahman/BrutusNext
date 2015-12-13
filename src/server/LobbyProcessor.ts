/*
  Part of BrutusNEXT

  Handles user lobby.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {PlayerConnection} from '../server/PlayerConnection';

const GAME_MENU =
    "\r\n&wWelcome to &RBRUTUS &YNext!\r\n"
  + "\r\n"
  + "&G0&g) &bExit from &RBRUTUS &YNext.\r\n"
  + "&G1&g) &BEnter the game.\r\n"
  + "\r\n"
  + "&wMake your choice: ";

export class LobbyProcessor
{
  // In this special case it's ok to hold direct reference to
  // PlayerConnection, because our instance of LobbyProcessor
  // is owned by the very PlayerConnection we are storing reference
  // of here. In any other case, unique id of PlayerConnection (within
  // PlayerConnectionManager) needs to be used instead of a direct reference!
  constructor(protected myPlayerConnection: PlayerConnection) { }

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
    this.myPlayerConnection.send(GAME_MENU);
  }

  protected processMenuChoice(choice: string)
  {
    switch (choice)
    {
      case "0": // Quit the game.
        this.myPlayerConnection.send(
          "&wGoodbye. Have a nice day...\r\n");

        this.myStage = LobbyProcessor.stage.NOT_IN_LOBBY;
        this.myPlayerConnection.quitGame();
        break;
      case "1": // Enter the game.
        this.myStage = LobbyProcessor.stage.NOT_IN_LOBBY;
        this.myPlayerConnection.enterGame();
        break;
      default:
        this.myPlayerConnection.send("That's not a menu choice!");
        this.sendMenu();
        break;
    }
  }
}
