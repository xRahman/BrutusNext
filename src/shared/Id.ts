/*
  Part of BrutusNEXT

  Unique identifier.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {Server} from '../server/Server';
import {SaveableObject} from '../shared/SaveableObject';

export class Id extends SaveableObject
{
  // myStringID should be unique per boot.
  // myType is the name of the class this id points to.
  constructor(protected myStringId: string, protected myType: string)
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;

    // Ids are saved to json by default.
    this.isSaved = true;
  }

  // New object is returned so you can use this to inicialize an id that will
  // be loaded from file later (if it was static value, loading multiple
  // 'uninitialized' ids would overwrite each other).
  public static get NULL() { return new Id("", ""); }

  /*
  // Use SAVED_NULL if you want your null id saved to json.
  public static get SAVED_NULL()
  {
    let nullId = new Id("", "");

    nullId.isSaved = true;

    return nullId;
  }
  */

  public get stringId() { return this.myStringId; }
  public get type() { return this.myType; }

  public equals(operand: Id)
  {
    ASSERT(operand.stringId !== "", "Attempt to compare to an invalid id");
    ASSERT(this.stringId !== "", "Attempt to compare an invalid id");

    if (this.stringId !== operand.stringId)
      return false;

    return true;
  }

  public isNull() { return this.stringId === ""; }
  public notNull() { return this.stringId !== ""; }

  // -------------- Protected class data ----------------

}