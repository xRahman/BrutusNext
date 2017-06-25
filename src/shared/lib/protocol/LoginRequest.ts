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

  public accountName: string = null;
  public password: string = null;

  public isValid(): boolean
  {
    let isValid = true;

    if (!this.accountName)
    {
      ERROR("Missing or invalid 'accountName' in login request");
      isValid = false;
    }

    if (!this.password)
    {
      ERROR("Missing or invalid 'password' in login request");
      isValid = false;
    }

    return isValid;
  }
}

Classes.registerSerializableClass(LoginRequest);