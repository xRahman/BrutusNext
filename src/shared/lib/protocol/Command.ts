/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Command sent by player.
*/

import {Packet} from '../../../shared/lib/protocol/Packet';
import {Classes} from '../../../shared/lib/class/Classes';

export class Command extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  public command: string;
}

Classes.registerSerializableClass(Command);