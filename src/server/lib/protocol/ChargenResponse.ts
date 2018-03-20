/*
  Part of BrutusNEXT

  Server-side version of character creation response packet.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {SharedChargenResponse} from
  '../../../shared/lib/protocol/SharedChargenResponse';

export class ChargenResponse extends SharedChargenResponse
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

Classes.registerSerializableClass(ChargenResponse);