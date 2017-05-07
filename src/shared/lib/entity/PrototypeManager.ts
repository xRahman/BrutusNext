/*
  Part of BrutusNEXT

  Manages prototype entities.
*/

'use strict';

import {Entity} from '../../../shared/lib/entity/Entity';

export class PrototypeManager
{
  /// TODO: Asi by spíš celý PrototypeManager měl být name search list.
  // Key:   prototype name (which is the entity name)
  // Value: prototype entity
  protected prototypes = new Map<string, Entity>();

  // Initializes root prototype entities.
  public async initPrototypes(entityClasses: Array<string>)
  {
    // Nothing by default.
    // (There is nothing to be done on the client, all prototype
    //  entities are sent along with other entities.)
  }
}