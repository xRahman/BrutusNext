/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Handles transmitting of entities.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Entities} from '../../../shared/lib/entity/Entities';
import {Classes} from '../../../shared/lib/class/Classes';

export class SerializedEntity extends Serializable
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

  // -> Returns 'true' on success.
  public serialize(entity: Entity, mode: Serializable.Mode)
  {
    if (!entity || !entity.isValid())
    {
      ERROR("Attempt to serialize invalid entity:"
        + " " + entity.getErrorIdString());
      return false;
    }

    entity.serializeAncestorTree(this.data, mode);

    return true;
  }

  public deserialize<T extends Entity>
  (
    typeCast: { new (...args: any[]): T }
  )
  {
    let entity: (Entity | null) = null;

    // 'this.data' is an array of json strings - each representing
    // one serialized entity (beginning with rootmost ancestor).
    for (let jsonString of this.data)
    {
      // Load entity and all of its ancestor entities, starting
      // with it's root prototype entity.
      entity = Entities.loadEntityFromJsonString
      (
        jsonString,
        // We can't typecast to 'typeCast' here because ancestors
        // aren't instances of the same type as their descendant.
        Entity,
        // We have to overwrite existing entities. Even if wanted
        // to deserialize a completely new entity, we would still
        // have to deserialize (update) all it's ancestors which
        // most probably already exist on the client.
        true
      );
    }

    // 'entity' now contains last loaded entity, which is our instance.
    //   Dynamically check that entity is an instance of type T and
    // typecast to it.
    return entity.dynamicCast(typeCast);
  }
}

Classes.registerSerializableClass(SerializedEntity);