/*
  Part of BrutusNEXT

  Shared character data.
*/

'use strict';

import {Serializable} from '../../../shared/lib/class/Serializable';
import {Flags} from '../../../shared/lib/utils/Flags';
///import {Character} from '../../../shared/game/character/Character';
import {GameEntityData} from '../../../shared/game/GameEntityData';

export class CharacterData extends GameEntityData
{
  // ----------------- Public data ----------------------

  public flags = new Flags<CharacterData.Flags>();

  // ---------------- Public methods --------------------

  // ---------------- Event Handlers -------------------
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module CharacterData
{
  export enum Flags
  {
  }
}