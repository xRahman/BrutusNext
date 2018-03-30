/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to character creation request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Account} from '../../../shared/lib/account/Account';
import {Character} from '../../../shared/game/character/Character';
import {Response} from '../../../shared/lib/protocol/Response';
import {SerializedEntity} from '../../../shared/lib/protocol/SerializedEntity';
import {ChargenRequest} from '../../../shared/lib/protocol/ChargenRequest';
import {Classes} from '../../../shared/lib/class/Classes';

export abstract class ChargenResponse extends Response
{
  constructor
  (
    protected result: ChargenResponse.Result
  )
  {
    super();

    this.version = 0;
  }
}

// ------------------ Type declarations ----------------------

export module ChargenResponse
{
  // Data attached to the response in case the request is accepted.
  export type Data =
  {
    // Serialized account data.
    // (Client will use this to update character select form).
    serializedAccount: SerializedEntity;
    // Serialized data of newly added character.
    serializedCharacter: SerializedEntity;
  }

  export type Accepted =
  {
    status: "ACCEPTED";
    data: ChargenResponse.Data;
  }

  export type Rejected =
  {
    status: "REJECTED";
    problems: Array<ChargenRequest.Problem>;
  }

  export type Result = Accepted | Rejected;
}