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

  // ~ Overrides EntityManager.requestEntityName().
  // -> Returns 'false' if name change isn't allowed
  //    (that means always on the client).
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

  protected generateId(): string
  {
    ERROR("Attempt to generate an id on the client."
      + " That's not possible, only server entity"
      + " manager can generate ids");
    return null;
  }

  // ~ Overrides EntityManager.saveEntity().
  protected async saveEntity(entity: Entity)
  {
    // (It is possible that HTML5 Local Storage will be
    //  used in the future, however.)
    ERROR("Attempt to save entity " + entity.getErrorIdString()
      + " on the client. That's not possible, client"
      + " doesn't have save/load capability");
  }

  // ~ Overrides EntityManager.loadEntityById().
  protected async loadEntityById(id: string)
  {
    // (It is possible that HTML5 Local Storage will be
    //  used in the future, however.)
    ERROR("Attempt to load entity with id '" + id + "'"
      + " on the client. That's not possible, client"
      + " doesn't have save/load capability");
  }

  // ~ Overrides EntityManager.loadEntityByName().
  protected async loadEntityByName
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    // (It is possible that HTML5 Local Storage will be
    //  used in the future, however.)
    ERROR("Attempt to load entity '" + name + "'"
      + " on the client. That's not possible, client"
      + " doesn't have save/load capability");
  }

}