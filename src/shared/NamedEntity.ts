/*
  Part of BrutusNEXT

  Allows entities to be named.
*/

'use strict';

import {Entity} from '../shared/Entity';

export class NamedEntity extends Entity
{
  public name = "Unnamed Entity";
  public isNameUnique = false;

  // ---------------- Public methods --------------------

  // Returns something like "Character 'Zuzka' (id: d-imt2xk99)"
  // (indended for use in error messages).
  public getErrorIdString()
  {
    let id = this.getId();

    if (id === null)
      return this.className + " '" + this.name;

    return this.className + " '" + this.name + "'"
      + " (id: " + id.getStringId() + ")";
  }
}