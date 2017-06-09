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
  /// (a mít v sobě vnořený abbrevsearchlist)
  // Key:   prototype name (which is the entity name)
  // Value: prototype entity
  protected prototypeList = new Map<string, Entity>();

  // -> Returns 'undefined' if reqeusted prototype isn't found.
  public static get(prototypeName: string)
  {
    return App.prototypes.prototypeList.get(prototypeName);
  }

  public static has(prototypeName: string)
  {
    return App.prototypes.prototypeList.has(prototypeName);
  }

  public abstract async init(entityClasses: Array<string>);
}