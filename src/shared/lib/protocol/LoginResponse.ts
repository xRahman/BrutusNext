/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to login request.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Packet} from '../../../shared/lib/protocol/Packet';
import {EntityData} from '../../../shared/lib/protocol/EntityData';
import {Classes} from '../../../shared/lib/class/Classes';

export class LoginResponse extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  // Is the request accepted?
  public result = LoginResponse.Result.UNDEFINED;

  // Description of problem if the request is denied.
  public problem: string = null;

  // Serialized account data.
  public account: EntityData = null;

  public characters = new Array<EntityData>();

  // ---------------- Public methods --------------------

  public setAccount(account: Entity)
  {
    this.account = new EntityData();

    this.account.serializeEntity
    (
      account,
      Serializable.Mode.SEND_TO_CLIENT
    );
  }

  public addCharacter(character: Entity)
  {
    let characterData = new EntityData();

    characterData.serializeEntity
    (
      character,
      Serializable.Mode.SEND_TO_CLIENT
    );

    this.characters.push(characterData);
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