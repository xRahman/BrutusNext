/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Specifies format of mud message.
*/

import {Serializable} from '../../../shared/lib/class/Serializable';

export class TextMessage extends Serializable
{
  public message: string;
}