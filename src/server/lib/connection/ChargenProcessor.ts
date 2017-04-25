/*
  Part of BrutusNEXT

  Handles creation of a new character.
*/

'use strict';

import {Settings} from '../../../server/ServerSettings';
import {ERROR} from '../../../shared/lib/error/ERROR';
import {SharedUtils} from '../../../shared/lib/utils/SharedUtils';
import {NamedEntity} from '../../../server/lib/entity/NamedEntity';
import {Message} from '../../../server/lib/message/Message';
import {Connection} from '../../../server/lib/connection/Connection';
import {ServerApp} from '../../../server/lib/ServerApp';
import {Game} from '../../../server/game/Game';
import {Character} from '../../../server/game/character/Character';

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
        await this.newCharacterName(command);
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

  private async newCharacterName(name: string)
  {
    if (!this.isNameValid(name))
      // We don't advance the stage so the next user input will
      // trigger a processCharacterName() again.
      return;

    // Make the first letter uppercase and the rest lowercase.
    name = SharedUtils.upperCaseFirstCharacter(name);

    if (!await this.isNameAvailable(name))
      // We don't advance the stage so the next user input will
      // trigger a processCharacterName() again.
      return;

    /// DEBUG:
    console.log("After isNameAvailable() check");

    let character = await this.createCharacter(name);

    if (character === null)
    {
      this.announceCharacterCreationFailure(name);

      // Disconnect the player.
      this.connection.close();
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
        + " characters long?"
        + "\n"
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
        + "\n"
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

    let character = await account.createCharacter(name);

    if (character === null)
      return null;

    /// TODO: Tohle by se možná mohlo volat uvnitř account.createCharacter(). 
    ServerApp.onCharacterCreation(character);

    return character;
  }

  private enterGame(character: Character)
  {
    if (this.connection === null || this.connection.isValid() === false)
    {
      ERROR("Invalid connection, unable to enter game");
      return;
    }

    this.connection.leaveChargen();
    this.connection.enterGame(character);
  }

  protected announceCharacterCreationFailure(name: string)
  {
    // Notify the player what went wrong.
    if (this.connection !== null && this.connection.isValid())
    {
      Message.sendToConnection
      (
        "Something is wrong, character '" + name + "' already exists."
          + Message.PLEASE_CONTACT_ADMINS,
        Message.Type.CONNECTION_ERROR,
        this.connection
      );
    }
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