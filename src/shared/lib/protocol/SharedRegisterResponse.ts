/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to register request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Response} from '../../../shared/lib/protocol/Response';
import {SharedRegisterRequest} from
  '../../../shared/lib/protocol/SharedRegisterRequest';
import {SerializedEntity} from '../../../shared/lib/protocol/SerializedEntity';
import {Classes} from '../../../shared/lib/class/Classes';

export abstract class SharedRegisterResponse extends Response
{
  constructor
  (
    protected result: SharedRegisterResponse.Result
  )
  {
    super();

    this.version = 0;
  }
}

// ------------------ Type declarations ----------------------

export module SharedRegisterResponse
{
  // Data attached to the response in case the request is accepted.
  export type Data =
  {
    serializedAccount: SerializedEntity;
  }

  export type Accepted =
  {
    status: "ACCEPTED";
    data: SharedRegisterResponse.Data;
  }

  export type Rejected =
  {
    status: "REJECTED";
    problems: Array<SharedRegisterRequest.Problem>;
  }

  export type Result = Accepted | Rejected;
}