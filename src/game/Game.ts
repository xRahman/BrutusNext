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

  // ---------------- Public methods --------------------

  // Loads initial state of the game from disk.
  public load()
  {
  }

  // -------------- Protected class data ----------------

  // Game entities (characters, rooms, objects, etc.) are all stored in
  // this container, not in their respective managers. This allows access to
  // any game entity by it's id without knowing what kind of entity it is.
  protected myEntities = new IdContainer<GameEntity>();

  // Character mananger stores a list of all characters in game.
  protected myCharacterManager = new CharacterManager();

  // --------------- Protected methods ------------------
}