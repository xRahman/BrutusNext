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
import {CharacterFlags} from '../../game/characters/CharacterFlags';

export class Character extends GameEntity
{
  public characterFlags = new CharacterFlags();

  protected timeOfCreation = new Date();

  private adminLevel = AdminLevels.MORTAL;

  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // --------------- Public accessors -------------------

  public static get SAVE_DIRECTORY()
  {
    return "./data/characters/";
  }

  public getTimeOfCreation() { return this.timeOfCreation; }

  public getAdminLevel() { return this.adminLevel; }

  // ---------------- Public methods --------------------

  // Sets birthroom (initial location), CHAR_IMMORTALITY flag.
  public init(account: Account)
  {
    let world = Game.worldId.getEntity({ typeCast: World });

    if (this.getAdminLevel() > AdminLevels.MORTAL)
    {
      // Immortals enter game in System Room.
      this.setLocation(world.systemRoomId);
      this.characterFlags.set(CharacterFlags.GOD_PROTECTION);
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