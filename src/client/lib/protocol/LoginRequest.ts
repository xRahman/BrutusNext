/*
  Part of BrutusNEXT

  Client-side version of login request packet.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {SharedLoginRequest} from
  '../../../shared/lib/protocol/SharedLoginRequest';

export class LoginRequest extends SharedLoginRequest
{
  constructor(email: string, password: string)
  {
    super(email, password);

    this.version = 0;
  }

  // This class is empty, all functionality is inherited from
  // ancestor. It only exists to be added to Classes so it can
  // be be dynamically instantiated.
}

Classes.registerSerializableClass(LoginRequest);