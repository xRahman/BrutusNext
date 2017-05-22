/*
  Part of BrutusNEXT

  Handles game menu.
*/

'use strict';

import {Settings} from '../../../server/ServerSettings';
import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Entities} from '../../../shared/lib/entity/Entities';
///import {NamedEntity} from '../../../server/lib/entity/NamedEntity';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {Connection} from '../../../server/lib/connection/Connection';
import {ServerApp} from '../../../server/lib/app/ServerApp';
import {Account} from '../../../server/lib/account/Account';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Game} from '../../../server/game/Game';
import {ServerGameEntity} from '../../../server/game/entity/ServerGameEntity';
import {Character} from '../../../server/game/character/Character';
import {Characters} from '../../../server/game/character/Characters';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';

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

    Message.sendToConnection(menu, MessageType.GAME_MENU, this.connection);
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
    if (!this.connection)
    {
      ERROR("Invalid connection, unable to quit game");
      return;
    }

    Message.sendToConnection
    (
      "&wGoodbye.\n"
      + "Have a nice day...",
      MessageType.AUTH_INFO,
      this.connection
    );
    
    this.connection.leaveMenu();
    this.connection.close();
  }

  private async enterGame(characterName: string)
  {
    if (!this.connection)
    {
      ERROR("Invalid connection, unable to enter game");
      return;
    }

    this.connection.leaveMenu();

    let character = Characters.get(characterName);

    // If the character is online, reconnect to it.
    if (Entity.isValid(character))
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
  
/// TODO: Možná by tohle mělo být v Characters.
  private async loadCharacter(name: string): Promise<Character>
  {
    let character = await Entities.loadEntityByName
    (
      Character, // Typecast.
      name,
      Entity.NameCathegory.CHARACTER
    );

    if (!Entity.isValid(character))
    {
      this.announceCharacterLoadFailure(name);

      // There is no point in requesting password again
      // because the same error will probably occur again.
      // So we will just disconnect the player.
      this.connection.close();

      return null;
    }

    character.addToLists();

/// TODO: Asi by nebylo od věci updatnout referenci na character v Accountu.
/// (Až tam budou reference místo jmen characterů).

    return character;
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
        MessageType.GAME_MENU,
        this.connection
      );
      return;
    }

    await this.enterGame(characterName);
  }

  private async enterChargen()
  {
    if (!this.connection)
    {
      ERROR("Invalid connection");
      return false;
    }

    this.connection.leaveMenu();
    this.connection.enterChargen();
  }

  private composeMenu(): string
  {
    if (!this.connection === null)
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
      MessageType.SYSTEM_ERROR,
      AdminLevel.IMMORTAL
    );

    // Let the player know what went wrong.
    Message.sendToConnection
    (
      "Unable to load your character.\n"
        + Message.PLEASE_CONTACT_ADMINS,
      MessageType.CONNECTION_ERROR,
      this.connection
    );
  }
}