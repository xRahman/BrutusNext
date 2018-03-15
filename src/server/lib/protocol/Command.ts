/*
  Part of BrutusNEXT

  Server-side functionality related to player command packet.
*/

/*
  Note:
    This class needs to use the same name as it's ancestor in /shared,
  because class name of the /shared version of the class is written to
  serialized data on the client and is used to create /server version
  of the class when deserializing the packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Connection} from '../../../server/lib/connection/Connection';
import {Command as SharedCommand} from '../../../shared/lib/protocol/Command';
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