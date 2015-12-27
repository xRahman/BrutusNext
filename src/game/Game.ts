/*
  Part of BrutusNEXT

  Implements container for all game-related stuff.
*/

'use strict';

import {Server} from '../server/Server';
import {GameEntity} from '../game/GameEntity';
import {CharacterManager} from '../game/CharacterManager';
import {PlayerCharacterManager} from '../game/PlayerCharacterManager';
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

  public static get playerCharacterManager()
  {
    return Server.game.myPlayerCharacterManager;
  }

  // ---------------- Public methods --------------------

  // Loads initial state of the game from disk.
  public load()
  {
  }

  // -------------- Protected class data ----------------

  // Game entities (characters, rooms, objects, etc.) are all stored in
  // this container, not in their respective managers. This allows to access
  // any game entity by it's id without knowing what kind of entity it is.
  protected myEntities = new IdContainer<GameEntity>();

  // Character mananger handles all character in game, including player PCs.
  protected myCharacterManager = new CharacterManager();

  // Player character manager ensures that player characters have unique names.
  // It is used to create new player characters and to load/save them to disk.
  protected myPlayerCharacterManager = new PlayerCharacterManager();

  // --------------- Protected methods ------------------
}