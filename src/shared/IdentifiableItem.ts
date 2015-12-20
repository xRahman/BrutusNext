/*
  Part of BrutusNEXT

  And object that knows it's unique identifier.
*/

'use strict';

import {NamedClass} from '../shared/NamedClass';
import {Id} from '../shared/Id';

export class IdentifiableItem extends NamedClass
{
  // ----------------- Public data ----------------------

  public set id(value: Id) { this.myId = value; }
  public get id() { return this.myId; }

  // -------------- Protected class data ----------------

  // Unique id.
  protected myId: Id = null;
}