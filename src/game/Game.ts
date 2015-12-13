/*
  Part of BrutusNEXT

  Implements container for all game-related stuff.
*/

'use strict';

import {CharacterManager} from '../game/CharacterManager';

export class Game
{
  public get characterManager() { return this.myCharacterManager; }

  // Loads initial state of the game from disk.
  load()
  {
  }

  protected myCharacterManager = new CharacterManager();
}