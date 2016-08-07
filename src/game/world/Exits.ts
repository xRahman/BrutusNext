/*
  Part of BrutusNEXT

  List of exits from an entity (usually room) to other entities
  (usually rooms again).
*/

'use strict';

import {SaveableObject} from '../../shared/SaveableObject';
import {EntityId} from '../../shared/EntityId';

export class Exits extends SaveableObject
{
  // Shortcuts to access commonly used exit names.
  public get north() { return this.getExitId('north'); }
  public get south() { return this.getExitId('south'); }
  public get east() { return this.getExitId('east'); }
  public get west() { return this.getExitId('west'); }
  public get up() { return this.getExitId('up'); }
  public get down() { return this.getExitId('down'); }
  public get out() { return this.getExitId('out'); }

  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  public getExitId(exitName: string): EntityId
  {
    if (exitName in this.exits)
      return this.exits[exitName];
    else
      return null;
  }

  public addExit(exitName: string, exitId: EntityId)
  {
    this.exits[exitName] = exitId; 
  }

  // This hash map allows to access destination id using exit name.
  protected exits: { [exitName: string]: EntityId } = {};
}