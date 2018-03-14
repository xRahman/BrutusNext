/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Abstract ancestor of data packet classes.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Connection} from '../../../shared/lib/connection/Connection';

export abstract class Packet extends Serializable
{
  public async process(connection: Connection): Promise<void>
  {
    ERROR("Attempt to process() a packet which is"
      + " not supposed to be processed");
  }
}