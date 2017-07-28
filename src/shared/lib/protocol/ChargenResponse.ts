/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to character creation request.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
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

  // Serialized character data.
  public character = new EntityData();
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