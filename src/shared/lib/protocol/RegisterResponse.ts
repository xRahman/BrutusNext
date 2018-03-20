/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to register request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Response} from '../../../shared/lib/protocol/Response';
import {RegisterRequest} from '../../../shared/lib/protocol/RegisterRequest';
import {SerializedEntity} from '../../../shared/lib/protocol/SerializedEntity';
import {Classes} from '../../../shared/lib/class/Classes';

export abstract class RegisterResponse extends Response
{
  constructor
  (
    protected result: RegisterResponse.Result
  )
  {
    super();

    this.version = 0;
  }
}

// ------------------ Type declarations ----------------------

export module RegisterResponse
{
  // Data attached to the response in case the request is accepted.
  export type Data =
  {
    serializedAccount: SerializedEntity;
  }

  export type Accepted =
  {
    status: "ACCEPTED";
    data: RegisterResponse.Data;
  }

  export type Rejected =
  {
    status: "REJECTED";
    problems: Array<RegisterRequest.Problem>;
  }

  export type Result = Accepted | Rejected;
}