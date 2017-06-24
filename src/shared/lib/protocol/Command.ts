/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Command sent by player.
*/

import {Serializable} from '../../../shared/lib/class/Serializable';
import {Classes} from '../../../shared/lib/class/Classes';

export class Command extends Serializable
{
  constructor()
  {
    super();

    this.version = 0;
  }

  public command: string;
}

Classes.registerSerializableClass(Command);