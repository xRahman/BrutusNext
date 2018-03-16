/*
  Part of BrutusNEXT

  Server-side version of enter game response packet.
*/

'use strict';

import {Classes} from '../../../shared/lib/class/Classes';
import {EnterGameResponse as SharedEnterGameResponse} from
  '../../../shared/lib/protocol/EnterGameResponse';

export class EnterGameResponse extends SharedEnterGameResponse
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

Classes.registerSerializableClass(EnterGameResponse);