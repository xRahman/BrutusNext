/*
  Part of BrutusNEXT

  Abstract ancestor for saveable data of all game entities
  (rooms, items, characters, etc.).
*/

import {SaveableObject} from '../shared/SaveableObject';

export class GameEntityData extends SaveableObject
{
  public name: string = "";
}