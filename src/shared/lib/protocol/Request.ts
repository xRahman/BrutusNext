/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Ancestor of client request packets.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {SerializedEntity} from '../../../shared/lib/protocol/SerializedEntity';
import {Packet} from '../../../shared/lib/protocol/Packet';

export abstract class Request extends Packet
{
  // ----------------- Private data ---------------------

  // --------------- Public accessors -------------------

  // -------------- Protected methods -------------------

  // ! Throws an exception on error.
  protected serializeEntity(entity: Entity)
  {
    return new SerializedEntity
    (
      entity,
      Serializable.Mode.SEND_TO_CLIENT
    );
  }
}

// ------------------ Type declarations ----------------------

export module Request
{
  // export type Accepted = "REQUEST ACCEPTED";

  // export type Result = Accepted | Problems;

  /// Result je: Accepted | Error | Problems


  // export interface Problems
  // {
  //   // Any number of optional string properties.
  //   [key: string]: string | undefined
  // };
}