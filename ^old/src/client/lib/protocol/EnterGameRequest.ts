/*
  Part of BrutusNEXT

  Client-side version of enter game request packet.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {EnterGameRequest as SharedEnterGameRequest} from
  '../../../shared/lib/protocol/EnterGameRequest';

export class EnterGameRequest extends SharedEnterGameRequest
{
  constructor(characterId: string)
  {
    super(characterId);

    this.version = 0;
  }

  // This class is empty, all functionality is inherited from
  // ancestor. It only exists to be added to Classes so it can
  // be be dynamically instantiated.
}

// This overwrites ancestor class.
Classes.registerSerializableClass(EnterGameRequest);