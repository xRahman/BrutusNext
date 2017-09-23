/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Login request.
*/

'use strict';

import {Packet} from '../../../shared/lib/protocol/Packet';
import {Classes} from '../../../shared/lib/class/Classes';

export class LoginRequest extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  public email: string = null;
  public password: string = null;
}

Classes.registerSerializableClass(LoginRequest);