/*
  Part of BrutusNEXT

  Implements container for all game-related stuff.
*/

'use strict';

import {Server} from '../server/Server';
import {Id} from '../shared/Id';
import {GameEntity} from '../game/GameEntity';
import {CharacterManager} from '../game/CharacterManager';
import {IdContainer} from '../shared/IdContainer';
import {RoomPrototypeManager} from '../game/RoomPrototypeManager';

export class Game
{
  public static get entities()
  {
    return Server.game.myEntities;
  }

  public static get characterManager()
  {
    return Server.game.myCharacterManager;
  }

  public static get roomProrotypeManager()
  {
    return Server.game.myRoomPrototypeManager;
  }

  // ---------------- Public methods --------------------

  // Loads initial state of the game from disk.
  public load()
  {
    ///this.myRoomPrototypeManager.load();
  }

  // -------------- Protected class data ----------------

  // Game entities (characters, rooms, objects, etc.) are all stored in
  // this container, not in their respective managers. This allows access to
  // any game entity by it's id without knowing what kind of entity it is.
  protected myEntities = new IdContainer<GameEntity>();

  // Character mananger stores a list of all characters in game.
  protected myCharacterManager = new CharacterManager();

  // List of prototype rooms which are not directly accessible from game.
  // (They are loaded just for editing.)
  protected myRoomPrototypeManager = new RoomPrototypeManager();

  // --------------- Protected methods ------------------
}