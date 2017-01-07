/*
  Part of BrutusNEXT

  Handles game menu.
*/

'use strict';

import {Settings} from '../../Settings';
import {ERROR} from '../../shared/error/ERROR';
import {FATAL_ERROR} from '../../shared/error/FATAL_ERROR';
import {Utils} from '../../shared/Utils';
import {NamedEntity} from '../../shared/entity/NamedEntity';
import {Syslog} from '../../server/Syslog';
import {Connection} from '../../server/connection/Connection';
import {Server} from '../../server/Server';
import {Account} from '../../server/account/Account';
import {Message} from '../../server/message/Message';
import {Game} from '../../game/Game';
import {GameEntity} from '../../game/GameEntity';
import {Character} from '../../game/character/Character';
import {AdminLevel} from '../../server/AdminLevel';

export class MenuProcessor
{
  // In this special case it's ok to hold direct reference to
  // Connection, because our instance of MenuProcessor
  // is owned by the very Connection we are storing reference
  // of here. In any other case, unique id of Connection (within
  // Sever.connections) needs to be used instead of a direct reference!
  constructor(protected connection: Connection) { }

  private static get WELCOME()
  {
    return '&wWelcome to &RBRUTUS &YNext!';
  }

  private static get GAME_MENU()
  {
    return '&wPlease enter:\n'
      + '&g"&G0&g" &bto exit from &RBRUTUS &YNext.\n'
      + '&g"&G1&g" &Bto create new character.';
  }

  private static get MAKE_CHOICE()
  {
    return "\n\n&wMake your choice:";
  }

  // ----------------- Public data ----------------------

  // ---------------- Public methods --------------------

  public sendMenu()
  {
    let menu = MenuProcessor.WELCOME
      + "\n"
      + "\n"
      + this.composeMenu();

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
        await this.characterChoice(command);
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
    
    this.connection.leaveMenu();
    this.connection.close();
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
    let character = characterList.getCharacterByName(characterName);

    this.connection.leaveMenu();

    // If the character is online, reconnect to it.
    if (character && character.isValid())
    {
      this.connection.reconnectToCharacter(character);
      return;
    }

    // Otherwise load it from the disk.
    character = await this.loadCharacter(characterName);

    if (character === null)
      // Error messages are already handler by loadCharacter().
      return;

    this.connection.enterGame(character);
  }
  
  private async loadCharacter(name: string): Promise<Character>
  {
    // loadAccount() returns null if account doesn't exist on the disk.
    let character = await Game.characters.loadCharacter(name);

    if (character === null || !character.isValid())
    {
      this.announceCharacterLoadFailure(name);

      // There is no point in requesting password again
      // because the same error will probably occur again.
      // So we will just disconnect the player.
      this.connection.close();

      return null;
    }

    return character;
    /*
    /// DEBUG:
    console.log("loadCharacter()");

    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection, unable to load character");
      return;
    }

    let characterList = Game.characters;

    let character = new Character();

    /// TODO: Tohle možná udělat nechci - bude to nejspíš chtít vytvořit
    /// name lock file, což nepůjde, protože už existuje.
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

    return character;
    */
  }

  /*
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
      ///
      ///ERROR("Character name saved in file (" + character.getName() + ")"
      ///  + " doesn't match character file name (" + characterFileName + ")."
      ///  + " Renaming character to match file name");
      ///
      ///character.name = characterFileName;
      
    }
  }
  */

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
      return null;
    }

    if (name === null || name === undefined)
    {
      ERROR("Invalid name");
      return null;
    }

    if (name === "")
      // This is not an error, empty string means that user
      // have pressed 'return' instead of typing a menu option.
      return null;

    // Make the first letter uppercase and the rest lowercase.
    name = Utils.upperCaseFirstCharacter(name); 

    // 'getCharacterNameByAbbrev()' returns null if 'choice'
    // isn't an abbreviation of any character names on account.
    return account.getCharacterNameByAbbrev(name);
  }

  private async characterChoice(choice: string)
  {
    let characterName = this.matchCharacterName(choice);

    if (characterName === null)
    {
      let message =
        "That's neither a menu choice nor the name of your character."
        + "\n"
        + "\n"
        + this.composeMenu();

      Message.sendToConnection
      (
        message,
        /*
        "That's neither a menu choice nor the name of your character."
        + "\n"
        + "Please enter a valid menu choice or a name of one of your"
        + " characters:",
        */
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

    this.connection.leaveMenu();
    this.connection.enterChargen();
  }

  private composeMenu(): string
  {
    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection, game menu is not sent");
      return null;
    }

    let menu = MenuProcessor.GAME_MENU;
    let account = this.connection.account;

    if (account === null || account.isValid() === false)
    {
      ERROR("Invalid account, game menu is not sent");
      return null;
    }

    // Add an option to enter game as each of characters on the account. 
    for (let characterName of account.characterNames)
    {
      menu += '\n&g"&G' + characterName + '&g"&w to enter game as'
        + ' ' + characterName + '.';
    }

    menu += MenuProcessor.MAKE_CHOICE;

    return menu;
  }

  private announceCharacterLoadFailure(name: string)
  {
    // Let admins know what went wrong.
    Syslog.log
    (
      "Failed to load character " + name,
      Message.Type.SYSTEM_ERROR,
      AdminLevel.IMMORTAL
    );

    // Let the player know what went wrong.
    Message.sendToConnection
    (
      "Unable to load your character.\n"
        + Message.PLEASE_CONTACT_ADMINS,
      Message.Type.CONNECTION_ERROR,
      this.connection
    );
  }
}