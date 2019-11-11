/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to login request.
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

export abstract class LoginResponse extends Response
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  public result = LoginResponse.Result.UNDEFINED;

  public serializedAccount: (SerializedEntity | null) = null;

  public serializedCharacters = new Array<SerializedEntity>();

  // ---------------- Public methods --------------------

  // -> Returns 'false' on error.
  public serializeAccount(account: Account): boolean
  {
    this.serializedAccount = new SerializedEntity();

    this.serializedAccount.serialize
    (
      account,
      Serializable.Mode.SEND_TO_CLIENT
    );

    return this.serializeCharacters(account);
  }

  // --------------- Private methods --------------------

  // -> Returns 'false' on error.
  private serializeCharacters(account: Account): boolean
  {
    for (let character of account.data.characters.values())
    {
      if (!character.isValid())
      {
        ERROR("Invalid character (" + character.getErrorIdString + ")"
          + " on account " + account.getErrorIdString() + ". Character"
          + " is not added to login response");
        return false;
      }

      this.serializeCharacter(character);
    }

    return true;
  }

  private serializeCharacter(character: Character)
  {
    let serializedCharacter = new SerializedEntity();

    serializedCharacter.serialize
    (
      character,
      Serializable.Mode.SEND_TO_CLIENT
    );

    this.serializedCharacters.push(serializedCharacter);
  }
}

// ------------------ Type declarations ----------------------

export module LoginResponse
{
  export type Undefined = "UNDEFINED";

  export type Accepted =
  {
    status: "ACCEPTED";
    characterMove: Move;
    serializedLoadLocation: SerializedEntity;
  }

  export type Rejected =
  {
    status: "REJECTED";
    problems: LoginRequest.Problems;
  }

  export type Result = Undefined | Accepted | Rejected;
}

// export module LoginResponse
// {
//   export enum Result
//   {
//     UNDEFINED,
//     OK,
//     UNKNOWN_EMAIL,
//     INCORRECT_PASSWORD,
//     FAILED_TO_LOAD_ACCOUNT
//   }
// }