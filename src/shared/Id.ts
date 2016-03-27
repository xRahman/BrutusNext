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
  // stringId is a unique string.
  // type is the name of the class this id points to.
  constructor(protected stringId: string, protected type: string)
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  public getStringId() { return this.stringId; }
  public getType() { return this.type; }

  public equals(operand: Id)
  {
    ASSERT(operand.stringId !== "", "Attempt to compare to an invalid id");
    ASSERT(this.stringId !== "", "Attempt to compare an invalid id");

    if (this.stringId !== operand.stringId)
      return false;

    return true;
  }

  // -------------- Protected class data ----------------

}