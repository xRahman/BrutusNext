/*
  Part of BrutusNEXT

  Character (player or mob).
*/

'use strict';

import {Account} from '../../../server/lib/account/Account';
import {AdminLevel} from '../../../server/lib/admin/AdminLevel';
import {Game} from '../../../server/game/Game';
import {ServerGameEntity} from '../../../server/game/entity/ServerGameEntity';
import {World} from '../../../server/game/world/World';
import {CharacterFlags} from '../../../server/game/character/CharacterFlags';
import {ClassFactory} from '../../../shared/lib/ClassFactory';

export class Character extends ServerGameEntity
{
  public characterFlags = new CharacterFlags();

  protected timeOfCreation = new Date();

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
    let world = Game.world;

    if (this.getAdminLevel() > AdminLevel.MORTAL)
    {
      // Immortals enter game in System Room.
      this.setLocation(world.systemRoomId);
      this.characterFlags.set(CharacterFlags.GOD_PROTECTION);
    }
    else
    {
      // Mortals enter game in Tutorial Room.
      this.setLocation(world.tutorialRoom);
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

  // Entity removes itself from EntityLists so it can no longer
  // be searched by name, etc. This doesn't remove entity from EntityManager.
  // (overrides Entity.removeFromLists())
  public removeFromLists()
  {
    Game.characters.remove(this);
  }

  //----------------- Protected data --------------------

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

ClassFactory.registerPrototypeClass(Character);