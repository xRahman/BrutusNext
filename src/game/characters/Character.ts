/*
  Part of BrutusNEXT

  Character (player or mob).
*/

'use strict';

import {Id} from '../../shared/Id';
import {GameEntity} from '../../game/GameEntity';
import {CharacterData} from '../../game/characters/CharacterData';

export class Character extends GameEntity
{
  constructor(name: string)
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;

    this.myData = new CharacterData(name);
  }

  static get SAVE_DIRECTORY() { return "./data/characters/"; }

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // Announce to the room that player is entering game as this character.
  public announcePlayerEnteringGame()
  {
    // TODO
    // if (this.isPlayerCharacter())
    // {
         // Send a message to the room that a player has just entered game.
         // this.sendToRoom("&BZuzka &Whas entered the game. &wBe ready.");
    // }
  }

  // Announce to the room that player has reconnected to this entity.
  public announcePlayerReconnecting()
  {
    // TODO
    // if (this.isPlayerCharacter())
    // {
         // Send a message to the room that a player has just reconnected.
    // }
  }

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  /// TODO: Tohle nejspis bude platit pouze pro player charactery, NPC
  /// to budou mit jinak.
  // What file will this object be saved to.
  protected myGetSavePath(): string
  {
    if (this.hasUniqueName)
      return Character.SAVE_DIRECTORY + "unique/" + this.name + ".json";
    else
      return Character.SAVE_DIRECTORY + this.name + ".json";
  }

  // ---------------- Command handlers ------------------

  /*
  /// Testing
  protected doStand(argument)
  {
    console.log("Executed command 'stand': " + this.x);
  }

  /// Testing
  protected doSit(argument)
  {
    console.log("Haf haf! 'sit': " + this.x);
  }
  */
}
