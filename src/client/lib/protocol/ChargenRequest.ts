/*
  Part of BrutusNEXT

  Client-side version of character creation request packet.
*/

/*
  This class is empty, all functionality is inherited from
  ancestor. It only exists so it can be added to Classes to
  be able to be dynamically instantiated.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {ChargenRequest as SharedChargenRequest} from
  '../../../shared/lib/protocol/ChargenRequest';

export class ChargenRequest  extends SharedChargenRequest
{
  constructor(characterName: string)
  {
    super(characterName);

    this.version = 0;
  }
}

// This overwrites ancestor class.
Classes.registerSerializableClass(ChargenRequest);