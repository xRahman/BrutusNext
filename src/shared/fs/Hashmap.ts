/*
  Part of BrutusNEXT

  Auxiliary class that saves and loads Map objects to JSON files.
*/

'use strict';

import {SaveableObject} from '../../shared/fs/SaveableObject';

export class Hashmap extends SaveableObject
{
  constructor(map: Map<any, any>)
  {
    super();

    // Map is saved as it's Array representation.
    this.map = this.createArray(map);
  }

  // This property will be saved to JSON.
  // (it contains array representation of a hashmap)
  public map: Array<any> = null;

  private createArray(map: Map<any, any>): Array<any>
  {
    let result = [];

    for (let entry of map.entries())
      result.push(entry);
    
    return result;
  }
}