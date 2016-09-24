/*
  Part of BrutusNEXT

  Handles user lobby.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {FATAL_ERROR} from '../../shared/error/FATAL_ERROR';
import {Connection} from '../../server/connection/Connection';
import {Server} from '../../server/Server';
import {Account} from '../../server/account/Account';
import {Game} from '../../game/Game';
import {GameEntity} from '../../game/GameEntity';
import {Character} from '../../game/character/Character';
import {AdminLevel} from '../../server/AdminLevel';

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
        ERROR("LobbyProcessor has not yet been initialized, prompt"
          + " is not supposed be generated yet");
        break;

      case LobbyProcessor.stage.IN_MENU:
        // When player is in lobby, menu is his prompt.
        prompt = LobbyProcessor.GAME_MENU;
        break;

      case LobbyProcessor.stage.NOT_IN_LOBBY:
        ERROR("Player is not in lobby, LobbyProcessor"
          + " is not supposed generate prompt");
        break;

      default:
        ERROR("Unknown lobby stage: " + this.getStage());
        break;
    }

    return prompt;
  }

  public enterMenu()
  {
    let validStage = this.stage === LobbyProcessor.stage.INITIAL
                  || this.stage === LobbyProcessor.stage.NOT_IN_LOBBY;

    if (!validStage)
    {
      ERROR("Entering game menu from invalid"
        + " lobby stage (" + this.stage + ")");
    }

    this.stage = LobbyProcessor.stage.IN_MENU;
  }

  public processCommand(command: string)
  {
    switch (this.stage)
    {
      case LobbyProcessor.stage.INITIAL:
        ERROR("LobbyProcessor has not yet been initialized, it is not"
          + " supposed to process any commands yet");
        break;

      case LobbyProcessor.stage.IN_MENU:
        this.processMenuChoice(command);
        break;

       case LobbyProcessor.stage.NOT_IN_LOBBY:
        ERROR("LobbyProcessor is not supposed to process any commands"
          + " when user is not in lobby");
        break;

      default:
        ERROR("Unknown lobby stage: " + this.stage);
        break;
    }
  }

  public getStage() { return this.stage; }

  // -------------- Protected class data ----------------

  protected stage = LobbyProcessor.stage.INITIAL;

  // --------------- Protected methods ------------------

  protected async processMenuChoice(choice: string)
  {
    switch (choice)
    {
      case "0": // Quit the game.
        this.quitGame();
        break;

      case "1": // Enter the game.
        await this.enterGame();
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

  protected async enterGame()
  {
    let account = this.connection.account;

    if (account === null)
    {
      ERROR("Invalid account on connection");
      return;
    }

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
      let characterName = account.getCharacterName(0);

      if (characterName === null)
        // Error is already reported by getCharacterName().
        return;

      // Asynchronous reading from the file.
      // (the rest of the code will execute only after the reading is done)
      //   We need async call because we want to wait after player's
      //  character is loaded from file before actually entering the game.
      await this.enterGameAsCharacter(characterName);
    }
  }

  protected async enterGameAsCharacter(characterName: string)
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
    if (this.connection === null)
    {
      ERROR("Invalid player connection on account " + account.name
        + " Character is not created");
      return;
    }

    if (this.connection.ingameEntity !== null)
    {
      ERROR("Player account '" + account.name + "' has attempted"
        + " to enter game with ingame entity already attached");

      this.connection.sendAsBlock
      (
        "&wAn error occured while entering game."
        + " Please contact implementors."
      );

      return;
    }

    let character = account.createCharacter(account.name);

    this.stage = LobbyProcessor.stage.NOT_IN_LOBBY;

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

    if (character.getId() === null)
      FATAL_ERROR("Invalid id in saved file of character: " + character.name);


    if (characterFileName !== character.name)
    {
      ERROR("Character name saved in file (" + character.name + ")"
        + " doesn't match character file name (" + characterFileName + ")."
        + " Renaming character to match file name");

      character.name = characterFileName;
    }
  }

  protected attachConnectionToGameEntity(gameEntity: GameEntity)
  {
    this.connection.attachToGameEntity(gameEntity);
  }
}
