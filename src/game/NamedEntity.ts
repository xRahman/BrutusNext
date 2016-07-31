/*
  Part of BrutusNEXT

  Allows entities to be named.
*/

/// This link of entity inheritance chain is not really needed right now
/// (everything here could be inside GameEntity class), but I'll let it
/// like this, because it probably will beuseful later - když budu chtít
/// zd?dit GameEntity z n?jakého mezistupn? (t?eba AffectableEntity),
/// tak ten mezistupe? bude ur?it? chtít psát hlášky do logu a na to
/// bude pot?ebovat tuhle funkcionalitu.

'use strict';

import {EntityContainer} from '../game/EntityContainer';

export abstract class NamedEntity extends EntityContainer
{
  public name = "Unnamed Entity";
  public isNameUnique = false;

  // ---------------- Public methods --------------------

  // Returns something like "Character 'Zuzka' (id: d-imt2xk99)".
  // (indended for use in error messages)
  public getErrorIdString()
  {
    return this.className + " '" + this.name + "'"
      + " (id: " + this.getId().getStringId() + ")";
  }
}