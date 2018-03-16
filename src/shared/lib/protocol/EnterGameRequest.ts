/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Enter game request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Request} from '../../../shared/lib/protocol/Request';
import {Connection} from '../../../shared/lib/connection/Connection';
import {Classes} from '../../../shared/lib/class/Classes';

export abstract class EnterGameRequest extends Request
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
  /// TODO: V případě acceptu chci asi do accept typu zahrnout
  /// pripadna pribalena data (v pripade rejectu tam byt nemusi)
  /// - a mozna tohle cele presunout spis do Response...

  export enum ProblemType
  {
    ERROR
  };

  export type Problem =
  {
    type: ProblemType;
    message: string;
  };

  export type Problems = Array<Problem>;
}