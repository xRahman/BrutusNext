/*
  Part of BrutusNEXT

  Server-side version of register response packet.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {RegisterResponse as SharedRegisterResponse} from
  '../../../shared/lib/protocol/RegisterResponse';

export class RegisterResponse extends SharedRegisterResponse
{
  constructor(result: RegisterResponse.Result)
  {
    super(result);

    this.version = 0;
  }

  // This class is empty, all functionality is inherited from
  // ancestor. It only exists to be added to Classes so it can
  // be be dynamically instantiated.
}

export module RegisterResponse
{
  // Reexport ancestor types becuase they are not inherited automatically.
  export type Result = SharedRegisterResponse.Result;
}

Classes.registerSerializableClass(RegisterResponse);