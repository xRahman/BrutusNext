/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Login request.
*/

'use strict';

import {Request} from '../../../shared/lib/protocol/Request';
import {Classes} from '../../../shared/lib/class/Classes';

export class LoginRequest extends Request
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  public email: (string | null) = null;
  public password: (string | null) = null;
}

Classes.registerSerializableClass(LoginRequest);