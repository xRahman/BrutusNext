/*
  Part of BrutusNEXT

  Handles user lobby.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {PlayerConnection} from '../server/PlayerConnection';
import {Server} from '../server/Server';
import {Account} from '../server/Account';
import {Game} from '../game/Game';
import {GameEntity} from '../game/GameEntity';
import {Character} from '../game/characters/Character';
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
  constructor(protected playerConnection: PlayerConnection) { }

  // ---------------- Public methods --------------------

  public enterMenu()
  {
    ASSERT(this.stage === LobbyProcessor.stage.INITIAL
        || this.stage === LobbyProcessor.stage.NOT_IN_LOBBY,
      "Entering game menu from invalid lobby stage");

    this.stage = LobbyProcessor.stage.IN_MENU;
    this.sendMenu();
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

  protected stage = LobbyProcessor.stage.INITIAL;

  // --------------- Protected methods ------------------

  protected sendMenu()
  {
    this.playerConnection.send(GAME_MENU);
  }

  protected async processMenuChoice(choice: string)
  {
    let accountManager = Server.accountManager;
    let account = accountManager.getAccount(this.playerConnection.accountId);

    switch (choice)
    {
      case "0": // Quit the game.
        this.quitGame();
      break;

      case "1": // Enter the game.
        // Create a new character if there is non on this account yet.
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
        this.playerConnection.send("That's not a menu choice!");
        this.sendMenu();
      break;
    }
  }

  protected quitGame()
  {
    this.playerConnection.send("&wGoodbye. Have a nice day...\r\n");
    this.stage = LobbyProcessor.stage.NOT_IN_LOBBY;
    this.playerConnection.quitGame();
  }

  protected async enterGame(characterName: string)
  {
    this.stage = LobbyProcessor.stage.NOT_IN_LOBBY;

    let playerCharacterManager = Game.playerCharacterManager;

    // Check if character is already online.
    let character = playerCharacterManager.getPlayerCharacter(characterName);

    if (character)
    {
      this.attachConnectionToGameEntity(character);
      this.playerConnection.reconnectToCharacter();
    }
    else
    {
      await this.loadCharacter(characterName);

      this.playerConnection.enterGame();
    }
  }

  protected createCharacterAndEnterGame(account: Account)
  {
    if (!ASSERT(this.playerConnection.ingameEntityId === null,
      "Player account '" + account.name + "' has attempted to enter game"
      + "with ingame entity already attached"))
    {
      this.playerConnection.send("&wAn error occured while entering"
        + " game. Please contact implementors.");
    }

    let newCharacterId = this.createNewCharacter(account.name);

    if (newCharacterId)
    {
      let character = Game.entities.getItem(newCharacterId);

      this.attachConnectionToGameEntity(character);
      this.playerConnection.enterGame();
    }
  }
  
  protected async loadCharacter(characterName: string)
  {
    let characterManager = Game.playerCharacterManager;

    let character = new Character();

    character.name = characterName;

    // This needs to be set before loading so character will load from
    // correct directory.
    character.isNameUnique = true;

    // Character name is passed to check against character name saved
    // in file (they must by the same).
    await this.loadCharacterFromFile(character, characterName);

    // Add newly loaded character to characterManager (under it's original id).
    characterManager.addPlayerCharacterUnderExistingId(character);

    this.attachConnectionToGameEntity(character);
  }

  protected createNewCharacter(characterName: string): Id
  {
    let characterManager = Game.playerCharacterManager;
    let accountManager = Server.accountManager;
    let account = accountManager.getAccount(this.playerConnection.accountId);

    // Error messages are handled inside characterNameExists().
    if (this.characterNameExists(characterName))
      return null;

    // 'isNameUnique: true' because player characters have unique names.
    let newCharacterId =
      characterManager.createNewUniqueCharacter
      (
        characterName,
        this.playerConnection.id
      );

    account.addNewCharacter(characterName);

    Mudlog.log
    (
      "Player " + account.name + " has created a new character: "
      + characterName,
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL
    );

    return newCharacterId;
  }

  protected characterNameExists(characterName: string): boolean
  {
    let characterManager = Game.playerCharacterManager;

    if (characterManager.doesNameExist(characterName))
    {
      ASSERT(false,
        "Attempt to create character '" + characterName + "'"
        + " that already exists.");

      // Notify the player what went wrong.
      this.playerConnection.send
      (
        "Something is wrong, character with name '" + characterName + "'"
        + " already exists. Please contact implementors and ask them to"
        + "resolve this issue.\r\n"
      );

      return true;
    }

    return false;
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

    ASSERT_FATAL(character.id !== null,
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
    this.playerConnection.attachToGameEntity(gameEntity);
  }
}
