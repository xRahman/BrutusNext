/*
  Part of BrutusNEXT

  Manages prototype entities.
*/

'use strict';

import {App} from '../../../shared/lib/app/App';
import {Entity} from '../../../shared/lib/entity/Entity';

export class PrototypeManager
{
  /// TODO: Asi by spíš celý PrototypeManager měl být name search list.
  // Key:   prototype name (which is the entity name)
  // Value: prototype entity
  protected prototypes = new Map<string, Entity>();

  // -> Returns 'null' if prototype with requested 'prototypeName' isn't found.
  public static get(prototypeName: string)
  {
    return App.getPrototypeManager().get(prototypeName);
  }

  // Initializes root prototype entities.
  public async initPrototypes(entityClasses: Array<string>)
  {
    // Nothing by default.
    // (There is nothing to be done on the client, all prototype
    //  entities are sent along with other entities.)
  }

  // -> Returns 'null' if prototype with requested 'prototypeName' isn't found.
  private get(prototypeName: string)
  {
    let prototype = this.prototypes.get(prototypeName);

    if (!prototype)
      return null;

    return prototype;
  }
}