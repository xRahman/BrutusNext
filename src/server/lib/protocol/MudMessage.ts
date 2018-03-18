/*
  Part of BrutusNEXT

  Server-side version of mud message packet.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {MudMessage as SharedMudMessage} from
  '../../../shared/lib/protocol/MudMessage';

export class MudMessage extends SharedMudMessage
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

Classes.registerSerializableClass(MudMessage);