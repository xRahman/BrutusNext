/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to register request.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Packet} from '../../../shared/lib/protocol/Packet';
import {EntityData} from '../../../shared/lib/protocol/EntityData';
import {Classes} from '../../../shared/lib/class/Classes';

export class RegisterResponse extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // Is the request accepted?
  public result: RegisterResponse.Result = RegisterResponse.Result.UNDEFINED;

  // Description of problem if the request is denied.
  public problem: string = null;

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