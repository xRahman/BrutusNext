/*
  Part of BrutusNEXT

  Client-side version of character creation request packet.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {SharedChargenRequest} from
  '../../../shared/lib/protocol/SharedChargenRequest';

export class ChargenRequest  extends SharedChargenRequest
{
  constructor(characterName: string)
  {
    super(characterName);

    this.version = 0;
  }

  // This class is empty, all functionality is inherited from
  // ancestor. It only exists to be added to Classes so it can
  // be be dynamically instantiated.
}

// This overwrites ancestor class.
Classes.registerSerializableClass(ChargenRequest);