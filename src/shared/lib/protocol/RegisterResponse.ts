/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to register request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Response} from '../../../shared/lib/protocol/Response';
import {EntityData} from '../../../shared/lib/protocol/EntityData';
import {Classes} from '../../../shared/lib/class/Classes';

export class RegisterResponse extends Response
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  // Is the request accepted?
  public result = RegisterResponse.Result.UNDEFINED;

  // Serialized account data.
  public account = new EntityData();
}

// ------------------ Type declarations ----------------------

export module RegisterResponse
{
  export enum Result
  {
    UNDEFINED,
    OK,
    EMAIL_PROBLEM,
    PASSWORD_PROBLEM,
    FAILED_TO_CREATE_ACCOUNT
  }
}

Classes.registerSerializableClass(RegisterResponse);