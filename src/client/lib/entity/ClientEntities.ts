/*
  Part of BrutusNEXT

  Implements container to store instances of entities identified by
  unique string ids.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Entities} from '../../../shared/lib/entity/Entities';

export class ClientEntities extends Entities
{
  // --------------- Protected methods ------------------

  // ~ Overrides Entities.requestName().
  // -> Returns 'false'.
  protected async requestName
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

  // ~ Overrides Entities.releaseName().
  protected async releaseName
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  {
    ERROR("Attempt to release the name of an entity."
      + " That's not allowed on the client");
  }

  // ~ Overrides Entities.saveEntity().
  protected async saveEntity(entity: Entity)
  {
    // (It is possible that HTML5 Local Storage will be
    //  used in the future, however.)
    ERROR("Attempt to save entity " + entity.getErrorIdString()
      + " on the client. That's not possible, client"
      + " doesn't have save/load capability");
  }

  // ~ Overrides Entities.loadEntityById().
  protected async loadEntityById(id: string): Promise<Entity>
  {
    // (It is possible that HTML5 Local Storage will be
    //  used in the future, however.)
    ERROR("Attempt to load entity with id '" + id + "'"
      + " on the client. That's not possible, client"
      + " doesn't have save/load capability");

    return null;
  }

  // ~ Overrides Entities.loadEntityByName().
  protected async loadEntityByName
  (
    name: string,
    cathegory: Entity.NameCathegory
  )
  : Promise<Entity>
  {
    // (It is possible that HTML5 Local Storage will be
    //  used in the future, however.)
    ERROR("Attempt to load entity '" + name + "'"
      + " on the client. That's not possible, client"
      + " doesn't have save/load capability");

    return null;
  }
}