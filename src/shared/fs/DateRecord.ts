/*
  Part of BrutusNEXT

  Auxiliary class that saves and loads Date objects to JSON files.
*/

'use strict';

import {SaveableObject} from '../../shared/fs/SaveableObject';

export class DateRecord extends SaveableObject
{
  constructor(date: Date)
  {
    super();

    // Date is saved as it's JSON string representation.
    this.date = JSON.stringify(date);
  }

  // This property will be saved to JSON.
  // (it contains string representation of a Date object)
  public date: string = null;
}
