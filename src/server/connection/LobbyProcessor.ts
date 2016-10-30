/*
  Part of BrutusNEXT

  Handles user lobby.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {FATAL_ERROR} from '../../shared/error/FATAL_ERROR';
import {NamedEntity} from '../../shared/entity/NamedEntity';
import {Connection} from '../../server/connection/Connection';
import {Server} from '../../server/Server';
import {Account} from '../../server/account/Account';
import {Message} from '../../server/message/Message';
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

  private static get GAME_MENU()
  {
    return '&wWelcome to &RBRUTUS &YNext!\n'
      + '\n'
      + '&wPlease enter:\n'
      + '&g"&G0&g" &bto exit from &RBRUTUS &YNext.\n'
      + '&g"&G1&g" &Bto create new character.\n';
  }

  private static get MAKE_CHOICE()
  {
    return "\n\n&wMake your choice:";
  }

  // ----------------- Public data ----------------------

  // ---------------- Public methods --------------------

  public sendMenu()
  {
    let menu = this.composeMenu();

    if (menu === null)
      // Menu coundn't be composed so there is nothing to send.
      return;

    Message.sendToConnection(menu, Message.Type.GAME_MENU, this.connection);
  }

  public async processCommand(command: string)
  {
    switch (command)
    {
      case "0": // Quit the game.
        this.quitGame();
        break;

      case "1": // Create new character.
        await this.enterChargen();
        break;

      default:
        await this.processCharacterChoice(command);
        break;
    }
  }

  //----------------- Protected data --------------------

  // ---------------- Private methods --------------------

  private quitGame()
  {
    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection, unable to quit game");
      return;
    }

    Message.sendToConnection
    (
      "&wGoodbye.\n"
      + "Have a nice day...",
      Message.Type.AUTH_INFO,
      this.connection
    );
    this.connection.leaveLobby();
    this.connection.quitGame();
  }

  private async enterGame(characterName: string)
  {
    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection, unable to enter game");
      return;
    }

    let characterList = Game.characters;

    // Check if character is already online.
    let character = characterList.getPlayerCharacter(characterName);

    if (character)
    {
      this.connection.attachToGameEntity(character);
      this.connection.leaveLobby();
      this.connection.reconnectToCharacter();
    }
    else
    {
      await this.loadCharacter(characterName);

      this.connection.leaveLobby();
      this.connection.enterGame();
    }
  }
  
  private async loadCharacter(characterName: string)
  {
    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection, unable to load character");
      return;
    }

    let characterList = Game.characters;

    let character = new Character();

    character.setUniqueName
    (
      characterName,
      NamedEntity.NameCathegory.characters
    );

    // Character name is passed to check against character name saved
    // in file (they must by the same).
    await this.loadCharacterFromFile(character, characterName);

    // Add newly loaded character to characterManager (under it's original id).
    characterList.addPlayerCharacterUnderExistingId(character);

    this.connection.attachToGameEntity(character);
  }

  private async loadCharacterFromFile
  (
    character: Character,
    characterFileName: string
  )
  {
    // Asynchronous reading from the file.
    // (The rest of the code will execute only after the reading is done.)
    await character.load();

    if (character.getId() === null)
    {
      FATAL_ERROR("Invalid id in saved file of character:"
        + " " + character.getName());
    }

    if (characterFileName !== character.getName())
    {
      ERROR("Character name saved in file (" + character.getName() + ")"
        + " doesn't match character file name (" + characterFileName + ")");

      /// Přejmenovat character není tak jednoduchý - characterName jednoduchý
      /// unikátní, tzn. je třeba zkontrolovat unikátnost.
      /// TODO:
      /// - Navíc to možná bude celé jinak, používají se teď nameLockFily.
      /*
      ERROR("Character name saved in file (" + character.getName() + ")"
        + " doesn't match character file name (" + characterFileName + ")."
        + " Renaming character to match file name");

      character.name = characterFileName;
      */
    }
  }

  // Checks if 'name' matches (is an abbreviation of) any character names
  // on the account.
  // -> Returns matching full character name on success,
  //    null if 'name' does't match any of the character names on the account.
  private matchCharacterName(name: string): string
  {
    let account = this.connection.account;

    if (account === null || account.isValid() === false)
    {
      ERROR("Invalid account");
      return;
    }

    // 'getCharacterNameByAbbrev()' returns null if 'choice'
    // isn't an abbreviation of any character names on account.
    return account.getCharacterNameByAbbrev(name);
  }

  private async processCharacterChoice(choice: string)
  {
    let characterName = this.matchCharacterName(choice);
        
    if (characterName === null)
    {
      Message.sendToConnection
      (
        "That's neither a menu choice nor the name of your character."
        + "\nPlease enter valid menu choice or the name of one of your characters:",
        Message.Type.GAME_MENU,
        this.connection
      );

      return;
    }

    await this.enterGame(characterName);
  }

  private async enterChargen()
  {
    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection");
      return false;
    }

    this.connection.leaveLobby();
    this.connection.enterChargen();
  }

  private composeMenu(): string
  {
    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection, game menu is not sent");
      return null;
    }

    let menu = LobbyProcessor.GAME_MENU;
    let account = this.connection.account;

    if (account === null || account.isValid() === false)
    {
      ERROR("Invalid account, game menu is not sent");
      return null;
    }

    // Add an option to enter game as each of characters on the account. 
    for (let characterName of account.characterNames)
    {
      menu += '\n&g"&G' + characterName + '&g"&w to enter game as ' + characterName + ".";
    }

    menu += LobbyProcessor.MAKE_CHOICE;

    return menu;
  }
}