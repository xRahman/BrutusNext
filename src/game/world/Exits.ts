/*
  Part of BrutusNEXT

  List of exits from an entity (usually room) to other entities
  (usually rooms again).
*/

'use strict';

import {SaveableObject} from '../../shared/SaveableObject';
import {GameEntity} from '../../game/GameEntity';
///import {EntityId} from '../../shared/EntityId';

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

  public getExit(exitName: string): GameEntity
  {
    if (exitName in this.exits)
      return this.exits[exitName];
    else
      return null;
  }

  public addExit(exitName: string, exit: GameEntity)
  {
    this.exits[exitName] = exit; 
  }

  // TODO: P?ed?lat na new Map();
  // This hash map allows to access destination entity using exit name.
  protected exits: { [exitName: string]: GameEntity } = {};
}