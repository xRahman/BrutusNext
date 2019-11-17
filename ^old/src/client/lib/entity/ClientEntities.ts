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

  // ~ Overrides Entities.saveEntity().
  protected async saveEntity(entity: Entity): Promise<boolean>
  {
    // (It is possible that HTML5 Local Storage will be
    //  used in the future, however.)
    ERROR("Attempt to save entity " + entity.getErrorIdString()
      + " on the client. That's not possible, client"
      + " doesn't have save/load capability");

    return false;
  }

  // ~ Overrides Entities.loadEntityById().
  protected async loadEntityById(id: string): Promise<Entity | null>
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
  : Promise<Entity | null | undefined>
  {
    // (It is possible that HTML5 Local Storage will be
    //  used in the future, however.)
    ERROR("Attempt to load entity '" + name + "'"
      + " on the client. That's not possible, client"
      + " doesn't have save/load capability");

    return null;
  }
}