/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Character selection request.
*/

'use strict';

import {Packet} from '../../../shared/lib/protocol/Packet';
import {Classes} from '../../../shared/lib/class/Classes';

export class CharselectRequest extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  public characterId: string = null;
}

Classes.registerSerializableClass(CharselectRequest);