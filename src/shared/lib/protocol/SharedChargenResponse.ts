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
import {SharedChargenRequest} from
  '../../../shared/lib/protocol/SharedChargenRequest';
import {Classes} from '../../../shared/lib/class/Classes';

export abstract class SharedChargenResponse extends Response
{
  constructor
  (
    protected result: SharedChargenResponse.Result
  )
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  // // Serialized account data.
  // // (We send account back to client, not the created character,
  // //  because client will need updated account to display character
  // //  select form).
  // public serializedAccount: (SerializedEntity | null) = null;

  // // Serialized data of newly added character.
  // public serializedCharacter: (SerializedEntity | null) = null;

  // ---------------- Public methods --------------------

  // // -> Returns 'true' on success.
  // public serializeAccount(account: Account)
  // {
  //   this.serializedAccount = new SerializedEntity();

  //   return this.serializedAccount.serialize
  //   (
  //     account,
  //     Serializable.Mode.SEND_TO_CLIENT
  //   );
  // }

  // // -> Returns 'true' on success.
  // public serializeCharacter(character: Character)
  // {
  //   this.serializedCharacter = new SerializedEntity();

  //   return this.serializedCharacter.serialize
  //   (
  //     character,
  //     Serializable.Mode.SEND_TO_CLIENT
  //   );
  // }
}

// ------------------ Type declarations ----------------------

export module SharedChargenResponse
{
  // Data attached to the response in case the request is accepted.
  export type Data =
  {
    // Serialized account data.
    // (Client will use this to display updated character select form).
    serializedAccount: SerializedEntity;
    // Serialized data of newly added character.
    serializedCharacter: SerializedEntity;
  }

  export type Accepted =
  {
    status: "ACCEPTED";
    // Separate type is used here because it is passed
    // as parameter when processing the packet on client.
    data: SharedChargenResponse.Data;
  }

  export type Rejected =
  {
    status: "REJECTED";
    problems: Array<SharedChargenRequest.Problem>;
  }

  export type Result = Accepted | Rejected;
}