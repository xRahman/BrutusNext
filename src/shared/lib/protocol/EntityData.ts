/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Handles transmitting of entities.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Entities} from '../../../shared/lib/entity/Entities';
import {Classes} from '../../../shared/lib/class/Classes';

export class EntityData extends Serializable
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  // Contains serialized entity and all it's ancestor
  // entities starting with root ancestor.
  public data = new Array<string>();

  // ---------------- Public methods --------------------

  public serializeEntity(entity: Entity, mode: Serializable.Mode)
  {
    if (!Entity.isValid(entity))
    {
      ERROR("Attempt to serialize invalid entity:"
        + " " + entity.getErrorIdString());
      return;
    }

    entity.serializeTree(this.data, mode);
  }

  public deserializeEntity<T extends Entity>
  (
    typeCast: { new (...args: any[]): T }
  )
  {
    let entity: T = null;

    for (let jsonString of this.data)
    {
      // Load entity and all of its ancestor entities, starting
      // with root prototype entity (because this.data contains
      // entity and it's prototype entities exactly in this order).
      entity = Entities.loadEntityFromJsonString(jsonString, typeCast);
    }

    // 'entity' now contains last loaded entity, which is our instance.
    return entity;
  }
}

Classes.registerSerializableClass(EntityData);