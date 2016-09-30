/*
  Part of BrutusNEXT

  Implements container template class to store objects identified by
  unique ids.
*/

'use strict';

import {FATAL_ERROR} from '../../shared/error/FATAL_ERROR';

export class IdProvider
{
  //------------------ Private data ---------------------

  // Number of issued ids in this boot.
  private lastIssuedId = 0;

  constructor(private timeOfBoot: Date) { }

  // ---------------- Public methods --------------------

  private generateId()
  {
    if (this.timeOfBoot === null)
    {
      FATAL_ERROR("Uninicialized timeOfBoot in IdProvider."
        + " Unable to generate ids");
    }

    // Increment lastIssuedId first so we start with 1 (initial value is 0).
    this.lastIssuedId++;

    // String id consists of radix-36 representation of lastIssuedId
    // and a radix-36 representation of current boot timestamp
    // (in miliseconds from the start of computer age) separated by dash ('-').
    // (radix 36 is used because it's a maximum radix toString() allows to use
    // and thus it leads to the shortest possible string representation of id)
    return this.lastIssuedId.toString(36)
      + '-'
      + this.timeOfBoot.getTime().toString(36);
  }
}
