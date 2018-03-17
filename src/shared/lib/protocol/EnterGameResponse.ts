/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to character selection request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Move} from '../../../shared/lib/protocol/Move';
import {Request} from '../../../shared/lib/protocol/Request';
import {Response} from '../../../shared/lib/protocol/Response';
import {EnterGameRequest} from '../../../shared/lib/protocol/EnterGameRequest';
import {SerializedEntity} from '../../../shared/lib/protocol/SerializedEntity';
import {Classes} from '../../../shared/lib/class/Classes';

export abstract class EnterGameResponse extends Response
{
  constructor
  (
    protected result: EnterGameResponse.Result
  )
  {
    super();

    this.version = 0;
  }

  // --------------- Public accessors -------------------

  ///public getResult() { return this.result; }
}

// ------------------ Type declarations ----------------------

export module EnterGameResponse
{
  export type Accepted =
  {
    status: "ACCEPTED";
    characterMove: Move;
    serializedLoadLocation: SerializedEntity;
  }

  export type Rejected =
  {
    status: "REJECTED";
    message: string;
  }

  export type Result = Accepted | Rejected;
}