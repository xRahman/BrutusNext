/*
  Part of BrutusNEXT

  Auxiliary class that saves and loads entity references to JSON files.
*/

'use strict';

import {Entity} from '../../shared/entity/Entity';
import {SaveableObject} from '../../shared/fs/SaveableObject';

export class Reference extends SaveableObject
{
  constructor(entity: Entity)
  {
    super();

    // Entity reference is saved only as entity's string id.
    this.id = entity.getId();
  }

  // This property will be saved to JSON.
  // (it contains string id of referenced entity)
  public id: string = null;
}