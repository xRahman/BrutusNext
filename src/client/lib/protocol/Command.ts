/*
  Part of BrutusNEXT

  Client-side version of player command packet.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {SharedCommand} from '../../../shared/lib/protocol/SharedCommand';

export class Command extends SharedCommand
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

Classes.registerSerializableClass(Command);