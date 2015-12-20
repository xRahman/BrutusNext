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
  // myTypeOfId is the name of the contaier class that issued this id.
  constructor(protected myStringId: string)
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;

    this.myTimeOfBoot = Server.timeOfBoot;
  }

  // New object is returned so you can use this to inicialize an id that will
  // be loaded from file later (if it was static value, loagind multiple
  // 'uninitialized' ids would overwrite each other).
  public static get NULL() { return new Id(""); }

  public get stringId() { return this.myStringId; }
  public get timeOfBoot() { return this.myTimeOfBoot; }

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

  /// Time of boot is no longer used, ids are unique in all enternity. It is
  /// kept to just help with troubleshooting.
  protected myTimeOfBoot: Date = new Date(0);
}