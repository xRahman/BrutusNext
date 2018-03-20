/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Login request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Request} from '../../../shared/lib/protocol/Request';
import {Connection} from '../../../shared/lib/connection/Connection';
import {Classes} from '../../../shared/lib/class/Classes';

export abstract class SharedLoginRequest extends Request
{
  constructor
  (
    public email: string,
    public password: string
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
  //   ERROR("Attempt to call /shared/protocol/LoginRequest.process(). That's"
  //     + " not supposed to happen, only /server/protocol/LoginRequest can"
  //     + " be processed");

  //   return false;
  // }
}

// ------------------ Type declarations ----------------------

export module SharedLoginRequest
{
  export enum ProblemType
  {
    LOGIN_PROBLEM,
    ERROR
  };

  export type Problem =
  {
    type: ProblemType;
    message: string;
  };

  export type Problems = Array<Problem>;
}

// export module LoginRequest
// {
//   export enum ProblemType
//   {
//     LOGIN_PROBLEM,
//     ERROR
//   };

//   export type Problem =
//   {
//     type: ProblemType;
//     problem: string;
//   };

//   export type Problems = Array<Problem>;

//   export type Result = Request.Accepted | Problems;

//   // export interface Problems extends Request.Problems
//   // {
//   //   loginProblem?: string;
//   //   error?: string;
//   // }
// }