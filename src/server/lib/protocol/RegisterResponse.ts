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
  constructor()
  {
    super();

    this.version = 0;
  }

  /*
    This class is empty, all functionality is inherited from
    ancestor. It only exists so it can be added to Classes to
    be able to be dynamically instantiated.
  */
}

Classes.registerSerializableClass(RegisterResponse);