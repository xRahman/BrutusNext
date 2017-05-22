/*
  Part of BrutusNEXT

  Character (player or mob).
*/

'use strict';

import {Account} from '../../../server/lib/account/Account';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Game} from '../../../server/game/Game';
import {ServerGameEntity} from '../../../server/game/entity/ServerGameEntity';
import {World} from '../../../server/game/world/World';
import {Characters} from '../../../server/game/character/Characters';
import {Classes} from '../../../shared/lib/class/Classes';

export class Character extends ServerGameEntity
{
  protected timeOfCreation = new Date();

/// TODO: Tohle by asi nemělo být tady - admin levely jsou externě
/// v Admins.
  private adminLevel = AdminLevel.MORTAL;

  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // --------------- Public accessors -------------------

  /*
  public static get SAVE_DIRECTORY()
  {
    return "./data/characters/";
  }
  */

  public getTimeOfCreation() { return this.timeOfCreation; }

  public getAdminLevel() { return this.adminLevel; }

  // ---------------- Public methods --------------------

  // Sets birthroom (initial location), CHAR_IMMORTALITY flag.
  public init(account: Account)
  {
    let world = Game.getWorld();

    if (this.getAdminLevel() > AdminLevel.MORTAL)
    { 
      // Immortals enter game in System Room.
      world.systemRoom.insert(this);
      ///this.characterFlags.set(CharacterFlags.GOD_PROTECTION);
    }
    else
    {
      // Mortals enter game in Tutorial Room.
      world.tutorialRoom.insert(this);
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

  //----------------- Protected data --------------------

  // --------------- Protected methods ------------------

  // ~ Overrides Entity.addToNameLists().
  protected addToNameLists()
  {
    Characters.add(this);
    /// TODO
  }

  // ~ Overrides Entity.addToAbbrevLists().
  protected addToAbbrevLists()
  {
    /// TODO
  }

  // ~ Overrides Entity.removeFromNameLists().
  protected removeFromNameLists()
  {
    Characters.remove(this);
    /// TODO
  }

  // ~ Overrides Entity.removeFromAbbrevLists().
  protected removeFromAbbrevLists()
  {
    /// TODO
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

Classes.registerEntityClass(Character);