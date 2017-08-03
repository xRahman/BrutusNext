/*
  Part of BrutusNEXT

  Character (player or mob).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Time} from '../../../shared/lib/utils/Time';
import {Account} from '../../../server/lib/account/Account';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Admins} from '../../../server/lib/admin/Admins';
import {Game} from '../../../server/game/Game';
import {GameEntity} from '../../../server/game/GameEntity';
import {World} from '../../../server/game/world/World';
import {CharacterData} from '../../../shared/game/character/CharacterData';
import {Characters} from '../../../server/game/character/Characters';
import {Classes} from '../../../shared/lib/class/Classes';

export class Character extends GameEntity
{
  protected timeOfCreation = null;

/// TODO: Tohle by asi nemělo být tady - admin levely jsou externě
/// v Admins.
  // private adminLevel = AdminLevel.MORTAL;

  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // ----------------- Public data ----------------------

  public data = new CharacterData();

  // --------------- Public accessors -------------------

  /*
  public static get SAVE_DIRECTORY()
  {
    return "./data/characters/";
  }
  */

  public getTimeOfCreation(): string
  {
    if (this.timeOfCreation === null)
    {
      ERROR("Time of creation has not been inicialized"
        + " on character " + this.getErrorIdString());
      return Time.UNKNOWN_TIME_STRING;
    }

    return this.timeOfCreation.toLocaleString();
  }

  public getAdminLevel()
  {
    return Admins.getAdminLevel(this);
  }

  // ---------------- Public methods --------------------

  // Sets birthroom (initial location), CHAR_IMMORTALITY flag.
  public init(account: Account)
  {
    if (this.getAdminLevel() > AdminLevel.MORTAL)
    {
/// TODO: Možná by bylo lepší rovnou World.systemRoom.
      // Immortals enter game in System Room.
      Game.world.systemRoom.insert(this);
      ///this.characterFlags.set(CharacterFlags.GOD_PROTECTION);
    }
    else
    {
/// TODO: Možná by bylo lepší rovnou World.tutorialRoom.
      // Mortals enter game in Tutorial Room.
      Game.world.tutorialRoom.insert(this);
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

  // ---------------- Protected data --------------------

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

  // ---------------- Event Handlers -------------------

  // Triggers when an entity is instantiated.
  protected onLoad()
  {
    // Calling Time() without parameters initializes it to current time.
    this.timeOfCreation = new Time();
  }
}

Classes.registerEntityClass(Character);