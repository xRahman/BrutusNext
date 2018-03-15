/*
  Part of BrutusNEXT

  Client-side version of account creation request packet.
*/

/*
  This class is empty, all functionality is inherited from
  ancestor. It only exists so it can be added to Classes to
  be able to be dynamically instantiated.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {RegisterRequest as SharedRegisterRequest} from
  '../../../shared/lib/protocol/RegisterRequest';

export class RegisterRequest extends SharedRegisterRequest
{
  constructor(email: string, password: string)
  {
    super(email, password);

    this.version = 0;
  }
}

Classes.registerSerializableClass(RegisterRequest);