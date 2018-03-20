/*
  Part of BrutusNEXT

  Server-side version of register response packet.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {SharedRegisterResponse} from
  '../../../shared/lib/protocol/SharedRegisterResponse';

export class RegisterResponse extends SharedRegisterResponse
{
  constructor(result: SharedRegisterResponse.Result)
  {
    super(result);

    this.version = 0;
  }

  // This class is empty, all functionality is inherited from
  // ancestor. It only exists to be added to Classes so it can
  // be be dynamically instantiated.
}

Classes.registerSerializableClass(RegisterResponse);