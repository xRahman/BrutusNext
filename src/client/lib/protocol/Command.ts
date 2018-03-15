/*
  Part of BrutusNEXT

  Client-side version of player command packet.
*/

/*
  This class is empty, all functionality is inherited from
  ancestor. It only exists so it can be added to Classes to
  be able to be dynamically instantiated.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {Command as SharedCommand} from '../../../shared/lib/protocol/Command';

export class Command extends SharedCommand
{
  constructor()
  {
    super();

    this.version = 0;
  }
}

Classes.registerSerializableClass(Command);