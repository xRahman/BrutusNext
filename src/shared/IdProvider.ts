/*
  Part of BrutusNEXT

  Implements generator of unique ids.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Mudlog} from '../server/Mudlog';
import {Id} from '../shared/Id';

export class IdProvider
{
  constructor(private timeOfBoot: Date) { }

  // -------------- Public static data ------------------

  // ---------------- Public methods --------------------

  // Use 'null' as a 'not pointing anywhere' id value. Id can be invalid
  // even if it's not null, for example when it's pointing to an object
  // which has already been deleted.
  public generateId(type: string): Id
  {
    // Increment lastIssuedId first so we start with 1 (initial value is 0).
    this.lastIssuedId++;

    // String id consists of radix-36 representation of lastIssuedId
    // and a radix-36 representation of current boot timestamp
    // (in miliseconds from the start of computer age) separated by dash ('-').
    // (radix 36 is used because it's a maximum radix toString() allows to use
    // and thus it leads to the shortest possible string representation of id)
    let stringId =
      this.lastIssuedId.toString(36)
      + '-'
      + this.timeOfBoot.getTime().toString(36);

    return new Id(stringId, type);
  }

  // -------------- Protected class data ----------------

  // Number of issued ids in this boot.
  protected lastIssuedId = 0;
}