/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to character selection request.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Response} from '../../../shared/lib/protocol/Response';
import {Classes} from '../../../shared/lib/class/Classes';

export class CharselectResponse extends Response
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  // Is the request accepted?
  public result = CharselectResponse.Result.UNDEFINED;

  // // Serialized character data.
  // public character = new EntityData();
}

// ------------------ Type declarations ----------------------

export module CharselectResponse
{
  export enum Result
  {
    UNDEFINED,
    OK,
    FAILED_TO_LOAD_CHARACTER
  }
}

Classes.registerSerializableClass(CharselectResponse);