/*
  Part of BrutusNEXT

  Client-side character.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Classes} from '../../../shared/lib/class/Classes';
import {GameEntity} from '../../../client/game/GameEntity';
import {CharacterData} from '../../../shared/game/character/CharacterData';

export class Character extends GameEntity
{
  constructor()
  {
    super();

    this.version = 0;
  }

  public data = new CharacterData();

  // --------------- Public accessors -------------------

  // -------------- Protected accessors -----------------

  // ---------------- Public methods --------------------

  // ---------------- Protected data --------------------

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------
}

Classes.registerEntityClass(Character);