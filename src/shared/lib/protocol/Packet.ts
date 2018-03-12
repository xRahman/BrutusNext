/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Specifies format of data packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Connection} from '../../../shared/lib/connection/Connection';

/// TODO: Společný předek možná nakone vůbec nebude potřeba.
export abstract class Packet extends Serializable
{
  public async process(connection: Connection): Promise<void>
  {
    ERROR("Attempt to process() a packet which is"
      + " not supposed to be processed");
  }
}