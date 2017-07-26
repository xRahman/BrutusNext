/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Mud message.
*/

import {Packet} from '../../../shared/lib/protocol/Packet';
import {Classes} from '../../../shared/lib/class/Classes';

export class MudMessage extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  public message: string;
}

Classes.registerSerializableClass(MudMessage);