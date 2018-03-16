/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to register request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Response} from '../../../shared/lib/protocol/Response';
import {SerializedEntity} from '../../../shared/lib/protocol/SerializedEntity';
import {Classes} from '../../../shared/lib/class/Classes';

export abstract class RegisterResponse extends Response
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
  public serializedAccount = new SerializedEntity();
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