/*
  Part of BrutusNEXT

  Character (player or mob).
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT'
import {Account} from '../../server/Account';
import {AdminLevels} from '../../server/AdminLevels';
import {Game} from '../../game/Game';
import {GameEntity} from '../../game/GameEntity';
import {World} from '../../game/world/World';

export class Character extends GameEntity
{
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
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

  // Sets birthroom (initial location), immortal flag, etc.
  public initNewCharacter(account: Account)
  {
    let world = Game.worldId.getEntity({ typeCast: World });

    /// TODO: Tohle dělá immortaly ze všech charů na accountu.
    /// Imm+ by měl být jen jeden z nich.
    if (account.getAdminLevel() > AdminLevels.MORTAL)
    {
      // Immortals enter game in System Room.
      this.setLocation(world.systemRoomId);

      /// TODO: Setnout charu immortal flagu.
    }
    else
    {
      // Mortals enter game in Tutorial Room.
      this.setLocation(world.tutorialRoomId);
    }
  }

  // Announce to the room that player is entering game as this character.
  public announcePlayerEnteringGame()
  {
    // if (this.isPlayerCharacter())
    // {
         // Send a message to the room that a player has just entered game.
         // this.sendToRoom("&BZuzka &Whas entered the game. &wBe ready.");
    // }
  }

  // Announce to the room that player is leaving game.
  public announcePlayerLeavingGame()
  {
    // if (this.isPlayerCharacter())
    // {
    // Send a message to the room that a player has just left game.
    // this.sendToRoom("&Zuzka has left the game.");
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