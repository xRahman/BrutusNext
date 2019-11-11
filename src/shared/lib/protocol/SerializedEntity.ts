/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Handles transmitting of entities.
*/

/*
  Entity is serialized along with all of it's ancestor prototypes
  so the whole prototype chain can be reconstructer when it is
  deserialized.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Entities} from '../../../shared/lib/entity/Entities';
import {Classes} from '../../../shared/lib/class/Classes';

export class SerializedEntity extends Serializable
{
  // ! Throws an exception on error.
  constructor(entity: Entity, mode: Serializable.Mode)
  {
    super();

    this.version = 0;

    if (!entity || !entity.isValid())
    {
      throw new Error
      (
        "Attempt to serialize invalid entity:"
        + " " + entity.getErrorIdString()
      );
    }

    this.serializedTree = entity.serializeAncestorTree(mode);
  }

  // ----------------- Public data ----------------------

  // Contains serialized entity and all it's ancestor
  // entities starting with root ancestor.
  public serializedTree: Array<string>;

  // ---------------- Public methods --------------------

  // ! Throws an exception on error.
  public recreateEntity<T extends Entity>
  (
    typeCast: { new (...args: any[]): T }
  )
  {
    let entity: (Entity | null) = null;

    // Load entity and all of its ancestor entities, starting
    // with it's root prototype entity.
    // ('this.serializedTree' is an array of json strings
    //  each representing one serialized entity beginning
    //  with root ancestor).
    for (let jsonString of this.serializedTree)
    {
      // 'entity' variable will be overwritten in each
      // cycle so at the end it will contain the last
      // loaded entity.
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

    if (!entity)
    {
      throw new Error
      (
        "Failed to recreate serialized entity because there"
          + " were no entities stored in serialized tree"
      );
    }

    // 'entity' now contains last loaded entity, which is our instance.
    //   Dynamically check that entity is an instance of type T and
    // typecast to it.
    return entity.dynamicCast(typeCast);
  }
}

Classes.registerSerializableClass(SerializedEntity);