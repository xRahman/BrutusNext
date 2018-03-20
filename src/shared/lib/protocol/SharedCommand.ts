/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Command sent by player.
*/

'use strict';

import {Packet} from '../../../shared/lib/protocol/Packet';
import {Classes} from '../../../shared/lib/class/Classes';

export abstract class SharedCommand extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  public command: (string | null) = null;
}