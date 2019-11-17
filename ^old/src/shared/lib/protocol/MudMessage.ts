/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Mud message.
*/

'use strict';

import {Packet} from '../../../shared/lib/protocol/Packet';
import {Classes} from '../../../shared/lib/class/Classes';

export abstract class SharedMudMessage extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  public message: string;
}