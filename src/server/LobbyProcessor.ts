/*
  Part of BrutusNEXT

  Handles user lobby.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {Connection} from '../server/Connection';
import {Server} from '../server/Server';
import {Account} from '../server/Account';
import {Game} from '../game/Game';
import {GameEntity} from '../game/GameEntity';
import {EntityId} from '../shared/EntityId';
import {Character} from '../game/characters/Character';
import {Mudlog} from '../server/Mudlog';
import {AdminLevels} from '../server/AdminLevels';

export class LobbyProcessor
{
  // In this special case it's ok to hold direct reference to
  // Connection, because our instance of LobbyProcessor
  // is owned by the very Connection we are storing reference
  // of here. In any other case, unique id of Connection (within
  // Sever.connections) needs to be used instead of a direct reference!
  constructor(protected connection: Connection) { }

  public static get GAME_MENU()
  {
    return "&wWelcome to &RBRUTUS &YNext!\n"
      + "\n"
      + "&G0&g) &bExit from &RBRUTUS &YNext.\n"
      + "&G1&g) &BEnter the game.\n"
      + "\n"
      + "&wMake your choice: ";
  }

  // ----------------- Public data ----------------------

  public static stage =
  {
    INITIAL: 'INITIAL', // Initial stage.
    IN_MENU: 'IN_MENU',
    NOT_IN_LOBBY: 'NOT_IN_LOBBY'
  }

  // ---------------- Public methods --------------------

  public generatePrompt(): string
  {
    let prompt = "&g>";

    switch (this.getStage())
    {
      case LobbyProcessor.stage.INITIAL:
        ASSERT(false, "LobbyProcessor has not yet been initialized, prompt"
          + " is not supposed be generated yet");
        break;

      case LobbyProcessor.stage.IN_MENU:
        // When player is in lobby, menu is his prompt.
        prompt = LobbyProcessor.GAME_MENU;
        break;

      case LobbyProcessor.stage.NOT_IN_LOBBY:
        ASSERT(false, "Player is not in lobby,"
          + " LobbyProcessor is not supposed generate prompt");
        break;

      default:
        ASSERT(false,
          "Unknown lobby stage: "
          + this.getStage());
        break;
    }

    return prompt;
  }

  public enterMenu()
  {
    ASSERT(this.stage === LobbyProcessor.stage.INITIAL
        || this.stage === LobbyProcessor.stage.NOT_IN_LOBBY,
      "Entering game menu from invalid lobby stage (" + this.stage + ")");

    this.stage = LobbyProcessor.stage.IN_MENU;
  }

  public processCommand(command: string)
  {
    switch (this.stage)
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
        ASSERT(false, "Unknown lobby stage: " + this.stage);
        break;
    }
  }

  public getStage() { return this.stage; }

  // -------------- Protected class data ----------------

  protected stage = LobbyProcessor.stage.INITIAL;

  // --------------- Protected methods ------------------

  protected async processMenuChoice(choice: string)
  {
    let account =
      this.connection.accountId.getEntity({ typeCast: Account });

    switch (choice)
    {
      case "0": // Quit the game.
        this.quitGame();
      break;

      case "1": // Enter the game.
        // Create a new character if there is none on this account yet.
        /// (for now player can only have one character and her name is the
        /// same as account name)
        if (account.getNumberOfCharacters() === 0)
        {
          this.createCharacterAndEnterGame(account);
        }
        else
        {
          // Enter game with first character (number '0').
          // (because for now players only have one character)
          //   Asynchronous reading from the file.
          // (The rest of the code will execute only after the reading is done.)
          // We need async call because we want to wait after player's character
          // is loaded from file before actually entering the game.
          await this.enterGame(account.getCharacterName(0));
        }
      break;

      default:
        this.connection.sendAsBlock("\nThat's not a menu choice!");
      break;
    }
  }

  protected quitGame()
  {
    this.connection.sendAsPrompt("&wGoodbye. Have a nice day...");
    this.stage = LobbyProcessor.stage.NOT_IN_LOBBY;
    this.connection.quitGame();
  }

  protected async enterGame(characterName: string)
  {
    this.stage = LobbyProcessor.stage.NOT_IN_LOBBY;

    let characterList = Game.characters;

    // Check if character is already online.
    let character = characterList.getPlayerCharacter(characterName);

    if (character)
    {
      this.attachConnectionToGameEntity(character);
      this.connection.reconnectToCharacter();
    }
    else
    {
      await this.loadCharacter(characterName);

      this.connection.enterGame();
    }
  }

  protected createCharacterAndEnterGame(account: Account)
  {
    if (!ASSERT(this.connection.ingameEntityId === null,
      "Player account '" + account.name + "' has attempted to enter game"
      + "with ingame entity already attached"))
    {
      this.connection.sendAsBlock
      (
        "&wAn error occured while entering game."
        + " Please contact implementors."
      );

      return;
    }

    let characterId = account.createCharacter(account.name);

    if (characterId === null)
      // Error messages are already handled by createrCharacter().
      return;

    this.stage = LobbyProcessor.stage.NOT_IN_LOBBY;

    let character = characterId.getEntity({ typeCast: Character });

    // Sets birthroom, immortal flag, etc.
    character.init(account);

    this.attachConnectionToGameEntity(character);
    this.connection.enterGame();
  }
  
  protected async loadCharacter(characterName: string)
  {
    let characterList = Game.characters;

    let character = new Character();

    character.name = characterName;

    // This needs to be set before loading so character will load from
    // correct directory.
    character.isNameUnique = true;

    // Character name is passed to check against character name saved
    // in file (they must by the same).
    await this.loadCharacterFromFile(character, characterName);

    // Add newly loaded character to characterManager (under it's original id).
    characterList.addPlayerCharacterUnderExistingId(character);

    this.attachConnectionToGameEntity(character);
  }

  protected async loadCharacterFromFile
  (
    character: Character,
    characterFileName: string
  )
  {
    // Asynchronous reading from the file.
    // (The rest of the code will execute only after the reading is done.)
    await character.load();

    ASSERT_FATAL(character.getId() !== null,
      "Invalid id in saved file of character: " + character.name);

    if (!ASSERT(characterFileName === character.name,
      "Character name saved in file (" + character.name + ")"
      + " doesn't match character file name (" + characterFileName + ")."
      + " Renaming character to match file name."))
    {
      character.name = characterFileName;
    }
  }

  protected attachConnectionToGameEntity(gameEntity: GameEntity)
  {
    this.connection.attachToGameEntity(gameEntity);
  }
}
