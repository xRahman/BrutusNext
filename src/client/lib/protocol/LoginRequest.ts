/*
  Part of BrutusNEXT

  Client-side version of login request packet.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {LoginRequest as SharedLoginRequest} from
  '../../../shared/lib/protocol/LoginRequest';

export class LoginRequest extends SharedLoginRequest
{
  constructor(email: string, password: string)
  {
    super(email, password);

    this.version = 0;
  }

  /*
    This class is empty, all functionality is inherited from
    ancestor. It only exists so it can be added to Classes to
    be able to be dynamically instantiated.
  */
}

Classes.registerSerializableClass(LoginRequest);