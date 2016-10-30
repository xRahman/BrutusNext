/*
  Part of BrutusNEXT

  Handles creation of a new character.
*/

'use strict';

import {Settings} from '../../Settings';
import {ERROR} from '../../shared/error/ERROR';
import {Utils} from '../../shared/Utils';
import {NamedEntity} from '../../shared/entity/NamedEntity';
///import {EntityManager} from '../../shared/entity/EntityManager';
///import {Syslog} from '../../server/Syslog';
///import {AdminLevel} from '../../server/AdminLevel';
import {Message} from '../../server/message/Message';
import {Connection} from '../../server/connection/Connection';
import {Server} from '../../server/Server';
///import {Account} from '../../server/account/Account';
import {Game} from '../../game/Game';
import {Character} from '../../game/character/Character';

export class ChargenProcessor
{
  public static get MAX_CHARACTER_NAME_LENGTH() { return 12; }
  public static get MIN_CHARACTER_NAME_LENGTH() { return 2; }

  constructor(protected connection: Connection) { }

  //------------------ Private data ---------------------

  private stage: ChargenProcessor.Stage = null;

  // ---------------- Public methods --------------------

  public async processCommand(command: string)
  {
    switch (this.stage)
    {
      case null:
        ERROR("ChargenProcessor has not yet been initialized, it is not"
          + " supposed to process any commands yet");
        break;

      case ChargenProcessor.Stage.GET_CHARACTER_NAME:
        await this.processCharacterName(command);
        break;

      default:
        ERROR("Unknown stage: " + this.stage);
        break;
    }
  }

  public start()
  {
    this.sendChargenPrompt("By what name shall your character be known?");

    this.stage = ChargenProcessor.Stage.GET_CHARACTER_NAME;
  }

  // --------------- Private methods --------------------

  private async processCharacterName(name: string)
  {
    if (!this.isNameValid(name))
      // We don't advance the stage so the next user input will trigger
      // a processCharacterName() again.
      return;

    // Make the first letter uppercase and the rest lowercase.
    name = Utils.upperCaseFirstCharacter(name);

    if (!await this.isNameAvailable(name))
      // We don't advance the stage so the next user input will trigger
      // a processCharacterName() again.
      return;

    let character = await this.createCharacter(name);

    if (character === null)
    {
      /// TODO: oznamit hraci, ze se nepovedlo vytvorit character
      /// TODO: disconnectnout ho (this.connection.quitGame());
      this.characterCreationFailure(name);
      return;
    }

    this.enterGame(character);
  }

  private sendChargenPrompt(text: string)
  {
    Message.sendToConnection
    (
      text,
      Message.Type.CHARGEN_PROMPT,
      this.connection
    );
  }

  private isNameValid(name: string): boolean
  {
    /// TODO: Časem asi nějaké přísnější testy:
    /// - určitě nepovolit víc než dvě opakování stejného písmene
    ///   (Gandaaaalf), adpod. 

    if (!name)
    {
      this.sendChargenPrompt
      (
        "You really need to enter a name for your new character, sorry.\n"
        + "Please enter a valid character name:"
      );

      return false;
    }

    // Only letters for now.
    let regExp = /[^A-Za-z]/;

    /// 'numbers allowed' variant:
    // This regexp will evaluate as true if tested string contains any
    // non-alphanumeric characters.
    ///    let regExp = /[^A-Za-z0-9]/;

    if (regExp.test(name) === true)
    {
      this.sendChargenPrompt
      (
        "Character name can only contain english letters.\n"
        + "Please enter a valid character name:"
      );

      return false;
    }

    if (name.length > ChargenProcessor.MAX_CHARACTER_NAME_LENGTH)
    {
      this.sendChargenPrompt
      (
        "Please pick a name up to"
        + " " + ChargenProcessor.MAX_CHARACTER_NAME_LENGTH
        + " characters long.\n"
        + "Enter a valid character name:"
      );

      return false;
    }

    if (name.length < ChargenProcessor.MIN_CHARACTER_NAME_LENGTH)
    {
      this.sendChargenPrompt
      (
        "Could you please pick a name that is at least"
        + " " + ChargenProcessor.MIN_CHARACTER_NAME_LENGTH
        + " characters long?\n"
        + "Enter a valid character name: "
      );

      return false;
    }

    return true;
  }

  private async isNameAvailable(name: string): Promise<boolean>
  {
    /// TODO: Časem asi nějaké přísnější testy - například nepovolit jméno,
    ///   když existuje jeho hodně blízký prefix.

    let available = !await NamedEntity.isNameTaken
    (
      name,
      NamedEntity.NameCathegory.characters
    );

    if (!available)
    {
      this.sendChargenPrompt
      (
        "Sorry, this name is not available."
        + "Please enter another character name:"
      );
    }

    return available;
  }

  // -> Returns 'null' if characred couldn't be created.
  private async createCharacter(name: string): Promise<Character>
  {
    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection, character is not created");
      return null;
    }

    let account = this.connection.account;

    if (account === null || account.isValid() === false)
    {
      ERROR("Invalid account, character is not created");
      return null;
    }

    let character = await this.connection.account.createCharacter(name);

    if (character === null)
      return null;

    Server.onCharacterCreation(character);

    return character;
  }

  private enterGame(character: Character)
  {
    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection, unable to enter game");
      return;
    }

    this.connection.attachToGameEntity(character);
    this.connection.leaveChargen();
    this.connection.enterGame();
  }

  protected characterCreationFailure(name: string)
  {
    // Notify the player what went wrong.
    if (this.connection !== null && this.connection.isValid())
    {
      this.sendChargenError("Something is wrong, character"
        + " named '" + name + "' already exists."
        + " Please contact admins at " + Settings.adminEmail
        + " and ask them to resolve this issue.");
    }
    

    // Disconnect the player.
    this.connection.quitGame();
  }
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module ChargenProcessor
{
  export enum Stage
  {
    GET_CHARACTER_NAME
  }
}