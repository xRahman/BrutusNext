/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to login request.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
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

  // Is the request accepted?
  public result: LoginResponse.Result = LoginResponse.Result.OK;

  // Description of problem if the request is denied.
  public problem: string = null;

  // Serialized account data.
  public account = new EntityData();
}

// ------------------ Type declarations ----------------------

export module LoginResponse
{
  export enum Result
  {
    OK,
    UNKNOWN_EMAIL,
    INCORRECT_PASSWORD,
    FAILED_TO_LOAD_ACCOUNT
  }
}

Classes.registerSerializableClass(LoginResponse);