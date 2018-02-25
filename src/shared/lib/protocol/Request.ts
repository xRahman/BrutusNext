/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Ancestor of client request packets.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Packet} from '../../../shared/lib/protocol/Packet';

export abstract class Request extends Packet
{
  // ----------------- Private data ---------------------

  // --------------- Public accessors -------------------

  // -------------- Protected methods -------------------
}

// ------------------ Type declarations ----------------------

export module Request
{
  export interface Problems
  {
    // Any number of optional string properties.
    [key: string]: string | undefined
  }
}