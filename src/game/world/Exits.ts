/*
  Part of BrutusNEXT

  List of exits from an entity (usually room) to other entities
  (usually rooms again).
*/

'use strict';

import {Id} from '../../shared/Id';
import {SaveableObject} from '../../shared/SaveableObject';

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

  public getExitId(exitName: string): Id
  {
    if (exitName in this.myExits)
      return this.myExits[exitName];
    else
      return Id.NULL;
  }

  public addExit(exitName: string, exitId: Id)
  {
    this.myExits[exitName] = exitId; 
  }

  // This hash map allows to access destination id using exit name.
  protected myExits: { [exitName: string]: Id } = {};
}