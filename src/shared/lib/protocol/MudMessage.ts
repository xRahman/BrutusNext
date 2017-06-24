/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Mud message.
*/

import {Serializable} from '../../../shared/lib/class/Serializable';
import {Classes} from '../../../shared/lib/class/Classes';

export class MudMessage extends Serializable
{
  constructor()
  {
    super();

    this.version = 0;
  }

  public message: string;
}

Classes.registerSerializableClass(MudMessage);