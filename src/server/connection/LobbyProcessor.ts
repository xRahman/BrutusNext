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
    return '&wWelcome to &RBRUTUS &YNext!\n'
      + '\n'
      + '&wPlease enter\n'
      + '&g"&G0&g" &bto exit from &RBRUTUS &YNext.\n'
      + '&g"&G1&g" &Bto create new character.\n';
  }

  public static get MAKE_CHOICE()
  {
    return "\n&wMake your choice:";
  }

  // ----------------- Public data ----------------------

  // ---------------- Public methods --------------------

  public generatePrompt(): string
  {
    return LobbyProcessor.GAME_MENU;
  }

  /*
  public enterMenu()
  {
    /// Možná poslat motd a menu?
  }
  */

  public async processCommand(command: string)
  {
    switch (command)
    {
      case "0": // Quit the game.
        this.quitGame();
        break;

      case "1": // Create new character.
        this.createCharacter();
        break;

      default:
        await this.processCharacterChoice(command);
        break;
    }
  }

  //----------------- Protected data --------------------

  // --------------- Protected methods ------------------

  protected quitGame()
  {
    this.connection.sendAsPrompt("&wGoodbye. Have a nice day...");
    this.connection.quitGame();
  }

  protected async enterGame(characterName: string)
  {
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

  // ---------------- Private methods --------------------

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
      // TODO: Posílat message, ne přímo string
      this.connection.sendAsBlock
      (
        "\nThat's neither a menu choice nor the name of your character."
        + "\nPlease enter valid menu choice or the name of one of your characters."
      );
      return;
    }

    await this.enterGame(characterName);
  }

  private createCharacter()
  {
    /// TODO

    /*
    let character = account.createCharacter(account.name);

    Server.onCharacterCreation(character);
    */
  }
}