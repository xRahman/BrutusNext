/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Character creation request.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Packet} from '../../../shared/lib/protocol/Packet';
import {Classes} from '../../../shared/lib/class/Classes';

export class ChargenRequest extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  public characterName: string = null;
}

Classes.registerSerializableClass(ChargenRequest);