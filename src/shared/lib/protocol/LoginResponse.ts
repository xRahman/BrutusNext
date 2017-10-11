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

export class LoginResponse extends Response
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  // Is the request accepted?
  public result = LoginResponse.Result.UNDEFINED;

  // Serialized account data.
  public serializedAccount: SerializedEntity = null;

  public serializedCharacters = new Array<SerializedEntity>();

  // ---------------- Public methods --------------------

  public setAccount(account: Account)
  {
    this.serializedAccount = new SerializedEntity();

    this.serializedAccount.store
    (
      account,
      Serializable.Mode.SEND_TO_CLIENT
    );
  }

  public addCharacter(character: Character)
  {
    let characterData = new SerializedEntity();

    characterData.store
    (
      character,
      Serializable.Mode.SEND_TO_CLIENT
    );

    this.serializedCharacters.push(characterData);
  }
}

// ------------------ Type declarations ----------------------

export module LoginResponse
{
  export enum Result
  {
    UNDEFINED,
    OK,
    UNKNOWN_EMAIL,
    INCORRECT_PASSWORD,
    FAILED_TO_LOAD_ACCOUNT
  }
}

Classes.registerSerializableClass(LoginResponse);