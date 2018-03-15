/*
  Part of BrutusNEXT

  Client-side version of system message packet.
*/

/*
  This class is empty, all functionality is inherited from
  ancestor. It only exists so it can be added to Classes to
  be able to be dynamically instantiated.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {SystemMessage as SharedSystemMessage} from
  '../../../shared/lib/protocol/SystemMessage';

export class SystemMessage extends SharedSystemMessage
{
  constructor()
  {
    super();

    this.version = 0;
  }
}

Classes.registerSerializableClass(SystemMessage);