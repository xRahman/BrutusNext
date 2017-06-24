/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Text message.
*/

import {Packet} from '../../../shared/lib/protocol/Packet';

export class TextMessage extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  public message: string;
}