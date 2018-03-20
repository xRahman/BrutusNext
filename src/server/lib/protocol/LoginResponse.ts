/*
  Part of BrutusNEXT

  Server-side version of login response packet.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {SharedLoginResponse} from
  '../../../shared/lib/protocol/SharedLoginResponse';

export class LoginResponse extends SharedLoginResponse
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // This class is empty, all functionality is inherited from
  // ancestor. It only exists to be added to Classes so it can
  // be be dynamically instantiated.
}

Classes.registerSerializableClass(LoginResponse);