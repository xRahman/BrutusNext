/*
  Part of BrutusNEXT

  Handles user lobby.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {PlayerConnection} from '../server/PlayerConnection';
import {Server} from '../server/Server';
import {Game} from '../game/Game';
import {Character} from '../game/Character';
import {Mudlog} from '../server/Mudlog';

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

  // --------------- Protected methods ------------------

  protected sendMenu()
  {
    this.myPlayerConnection.send(GAME_MENU);
  }

  protected async processMenuChoice(choice: string)
  {
    switch (choice)
    {
      case "0": // Quit the game.
        this.myPlayerConnection.send("&wGoodbye. Have a nice day...\r\n");
        this.myStage = LobbyProcessor.stage.NOT_IN_LOBBY;
        this.myPlayerConnection.quitGame();
        break;

      case "1": // Enter the game.
        this.myStage = LobbyProcessor.stage.NOT_IN_LOBBY;
        await this.enterGame();
        break;

      default:
        this.myPlayerConnection.send("That's not a menu choice!");
        this.sendMenu();
        break;
    }
  }

  protected async enterGame()
  {
    let accountManager = Server.accountManager;
    let characterManager = Game.characterManager;

    // For now, each account can only have one character and it's name is
    // the same as accountName.
    let characterName =
      accountManager.getAccount(this.myPlayerConnection.accountId).accountName;
    
    if (!characterManager.exists(characterName))
    {
      this.createNewCharacter(characterName);
      this.myPlayerConnection.enterGame();

      return;
    }

    // Check if character is already online.
    let character = characterManager.getCharacterByName(characterName);

    if (character)
    {
      this.myPlayerConnection.ingameEntityId = character.id;
      this.myPlayerConnection.reconnectToCharacter();
    }
    else
    {
      let character = new Character(characterName);

      // Character name is passed to check against character name saved
      // in file (they must by the same).
      await this.loadCharacterFromFile(character, characterName);

      // Add newly loaded account to characterManager (under it's original id).
      characterManager.registerLoadedCharacter(character);

      this.myPlayerConnection.ingameEntityId = character.id;
      this.myPlayerConnection.enterGame();
    }
  }

  protected async createNewCharacter(characterName: string)
  {
    let characterManager = Game.characterManager;
    let accountManager = Server.accountManager;
    let account = accountManager.getAccount(this.myPlayerConnection.accountId);

    let newCharacterId = characterManager
      .createNewCharacter(characterName, this.myPlayerConnection.id);

    this.myPlayerConnection.ingameEntityId = newCharacterId;
    account.addNewCharacter(characterName);

    Mudlog.log
    (
      "Player " + account.accountName + " has created a new character: "
      + characterName,
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL
    );
  }

  protected async loadCharacterFromFile
  (
    character: Character,
    characterFileName: string
  )
  {
    // Asynchronous reading from the file.
    // (the rest of the code will execute only after the reading is done)
    await character.load();

    ASSERT_FATAL(character.id.notNull(),
      "Null id in saved file of character: " + character.name);

    if (!ASSERT(characterFileName === character.name,
      "Character name saved in file (" + character.name + ")"
      + " doesn't match character file name (" + characterFileName + ")."
      + " Renaming character to match file name."))
    {
      character.name = characterFileName;
    }
  }
}
