/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Login request.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Packet} from '../../../shared/lib/protocol/Packet';
import {Classes} from '../../../shared/lib/class/Classes';

export class LoginRequest extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  ///public accountName: string = null;
  public email: string = null;
  public password: string = null;

  /// To be deleted.
  // public isValid(): boolean
  // {
  //   if (!this.email)
  //   {
  //     ERROR("Missing or invalid 'accountName' in login request");
  //     return false;
  //   }

  //   if (!this.password)
  //   {
  //     ERROR("Missing or invalid 'password' in login request");
  //     return false;
  //   }

  //   return true;
  // }
}

Classes.registerSerializableClass(LoginRequest);