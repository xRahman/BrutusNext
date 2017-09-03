/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Entity changing location.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Classes} from '../../../shared/lib/class/Classes';

export class EntityMove extends Serializable
{
  constructor
  (
    // Id of entity which is moved.
    public entityId: string,
    // Id of destination container entity.
    public destinationId: string
  )
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  // ---------------- Public methods --------------------
}

Classes.registerSerializableClass(EntityMove);