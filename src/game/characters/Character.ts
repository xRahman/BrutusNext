/*
  Part of BrutusNEXT

  Character (player or mob).
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT'
import {Id} from '../../shared/Id';
import {GameEntity} from '../../game/GameEntity';

export class Character extends GameEntity
{
  constructor(nameParam: { name: string, isNameUnique: boolean })
  {
    super(nameParam.name);

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
    this.isNameUnique = nameParam.isNameUnique;
  }

  // --------------- Public accessors -------------------

  // There is both static and nonstatic version of SAVE_DIRECTORY (both
  // return the same value), because we need to be able to access it without
  // an intance of Character, and we also need it to override SAVE_DIRECTORY
  // property inherited from GameEntity (which cannot be static, because
  // static properties can't be overriden).
  public static get SAVE_DIRECTORY()
  {
    return "./data/characters/";
  }

  // -------------- Protected accessors -----------------

  protected get SAVE_DIRECTORY() { return Character.SAVE_DIRECTORY; }

  // ----------------- Public data ---------------------- 

  /// TODO: Tohle by mozna mel mit az player, u mobu me to moc nezajima
  // dateofCreation always initializes to current time, but for existing
  // characters will be overwritten when loading from file. 
  public timeOfCreation = new Date();

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
