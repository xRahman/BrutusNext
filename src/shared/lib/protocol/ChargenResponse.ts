/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to character creation request.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Packet} from '../../../shared/lib/protocol/Packet';
import {EntityData} from '../../../shared/lib/protocol/EntityData';
import {Classes} from '../../../shared/lib/class/Classes';

export class ChargenResponse extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  // Is the request accepted?
  public result = ChargenResponse.Result.UNDEFINED;

  // Description of problem if the request is denied.
  public problem: string = null;

  // Serialized account data.
  // (We send account back to client, not the created character,
  //  because client will need updated account to display character
  //  select form).
  public account: EntityData = null;

  // Serialized data of newly added character.
  public character: EntityData = null;

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

  public setCharacter(character: Entity)
  {
    this.character = new EntityData();

    this.character.serializeEntity
    (
      character,
      Serializable.Mode.SEND_TO_CLIENT
    );
  }
}

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

Classes.registerSerializableClass(ChargenResponse);