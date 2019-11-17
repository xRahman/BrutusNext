/*
  Part of BrutusNEXT

  Shared character interface.
*/

'use strict';

import {Entity} from '../../../shared/lib/entity/Entity';
import {CharacterData} from '../../../shared/game/character/CharacterData';

export interface Character extends Entity
{
  data: CharacterData;
}