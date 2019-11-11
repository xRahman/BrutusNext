/*
  Part of BrutusNEXT

  Server-side version of character creation response packet.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {ChargenResponse as SharedChargenResponse} from
  '../../../shared/lib/protocol/ChargenResponse';

export class ChargenResponse extends SharedChargenResponse
{
  constructor(result: ChargenResponse.Result)
  {
    super(result);

    this.version = 0;
  }

  // This class is empty, all functionality is inherited from
  // ancestor. It only exists to be added to Classes so it can
  // be be dynamically instantiated.
}

// ------------------ Type declarations ----------------------

export module ChargenResponse
{
  // Reexport ancestor types becuase they are not inherited automatically.
  export type Result = SharedChargenResponse.Result;
}

Classes.registerSerializableClass(ChargenResponse);