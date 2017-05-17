/*
  Part of BrutusNEXT

  Manages prototype entities.
*/

'use strict';

import {App} from '../../../shared/lib/app/App';
import {Entity} from '../../../shared/lib/entity/Entity';

export abstract class Prototypes
{
  /// TODO: Asi by spíš Prototypes měly být name search list.
  // Key:   prototype name (which is the entity name)
  // Value: prototype entity
  protected prototypes = new Map<string, Entity>();

  // -> Returns 'null' if prototype with requested 'prototypeName' isn't found.
  public static get(prototypeName: string)
  {
    return App.getPrototypes().get(prototypeName);
  }

  public abstract async init(entityClasses: Array<string>);

  // -> Returns 'null' if reqeusted prototype isn't found.
  private get(prototypeName: string)
  {
    let prototype = this.prototypes.get(prototypeName);

    if (!prototype)
      return null;

    return prototype;
  }
}