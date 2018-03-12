/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Character selection request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Request} from '../../../shared/lib/protocol/Request';
import {Connection} from '../../../shared/lib/connection/Connection';
import {Classes} from '../../../shared/lib/class/Classes';

export class EnterGameRequest extends Request
{
  constructor
  (
    public characterId: string
  )
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  // ---------------- Public methods --------------------

  /// To be deleted.
  // // ~ Overrides Packet.process().
  // // -> Returns 'true' on success.
  // public async process(connection: Connection)
  // {
  //   ERROR("Attempt to call /shared/protocol/EnterGameRequest.process(). That's"
  //     + " not supposed to happen, only /server/protocol/EnterGameRequest can"
  //     + " be processed");

  //   return false;
  // }
}

// ------------------ Type declarations ----------------------

export module EnterGameRequest
{
  export interface Problems extends Request.Problems
  {
    error?: string;
  }
}

Classes.registerSerializableClass(EnterGameRequest);