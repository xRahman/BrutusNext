/*
  Part of BrutusNEXT

  List of exits from an entity (usually room) to other entities
  (usually rooms again).
*/

'use strict';

import {SaveableObject} from '../../shared/SaveableObject';
import {GameEntity} from '../../game/GameEntity';

export class Exits extends SaveableObject
{
  // Shortcuts to access commonly used exit names.
  public get north() { return this.getExit('north'); }
  public get south() { return this.getExit('south'); }
  public get east() { return this.getExit('east'); }
  public get west() { return this.getExit('west'); }
  public get up() { return this.getExit('up'); }
  public get down() { return this.getExit('down'); }
  public get out() { return this.getExit('out'); }

  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // -> returns undefined if exit doesn't exist.
  public getExit(exitName: string): GameEntity
  {
    return this.exits.get(exitName);
  }

  public addExit(exitName: string, exit: GameEntity)
  {
    this.exits.set(exitName, exit);
  }

  // Hashmap<[ string, GameEntity ]>
  //   Key: exit name
  //   Value: GameEntity this exit leads to.
  private exits = new Map();
}