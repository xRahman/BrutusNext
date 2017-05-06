/*
  Part of BrutusNEXT

  Implements container to store instances of entities identified by
  unique string ids.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {EntityManager} from '../../../shared/lib/entity/EntityManager';

export class ClientEntityManager extends EntityManager
{
  // --------------- Protected methods ------------------

  // Overrides EntityManager.requestEntityName().
  protected async requestEntityName
  (
    id: string,
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    ERROR("Attempt to change the name of an entity."
      + " That's not allowed on the client");

    return false;
  }

  protected async releaseEntityName
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    ERROR("Attempt to release the name of an entity."
      + " That's not allowed on the client");
  }
}