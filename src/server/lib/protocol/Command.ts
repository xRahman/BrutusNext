/*
  Part of BrutusNEXT

  Server-side functionality related to player command packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Connection} from '../../../server/lib/connection/Connection';
import {Command as SharedCommand} from
  '../../../shared/lib/protocol/Command';
import {Classes} from '../../../shared/lib/class/Classes';

export class Command extends SharedCommand
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ---------------- Public methods --------------------

  // ~ Overrides Packet.process().
  public async process(connection: Connection)
  {
    console.log("Received command: " + this.command);

    /// TODO:
    //let command = Utils.normalizeCRLF(packet.command);
  }

  // --------------- Private methods --------------------
}

Classes.registerSerializableClass(Command);