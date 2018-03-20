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
import {Classes} from '../../../shared/lib/class/Classes';

export abstract class SharedChargenResponse extends Response
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  // Is the request accepted?
  public result = SharedChargenResponse.Result.UNDEFINED;

  // Serialized account data.
  // (We send account back to client, not the created character,
  //  because client will need updated account to display character
  //  select form).
  public serializedAccount: (SerializedEntity | null) = null;

  // Serialized data of newly added character.
  public serializedCharacter: (SerializedEntity | null) = null;

  // ---------------- Public methods --------------------

  // -> Returns 'true' on success.
  public serializeAccount(account: Account)
  {
    this.serializedAccount = new SerializedEntity();

    return this.serializedAccount.serialize
    (
      account,
      Serializable.Mode.SEND_TO_CLIENT
    );
  }

  // -> Returns 'true' on success.
  public serializeCharacter(character: Character)
  {
    this.serializedCharacter = new SerializedEntity();

    return this.serializedCharacter.serialize
    (
      character,
      Serializable.Mode.SEND_TO_CLIENT
    );
  }
}

/// To be deleted.
/*
// ------------------ Type declarations ----------------------

export module ChargenResponse
{
  export enum Result
  {
    UNDEFINED,
    OK,
    CHARACTER_NAME_PROBLEM,
    FAILED_TO_CREATE_CHARACTER
  }
}
*/