/*
  Part of BrutusNEXT

  Server-side functionality related to character selection request packet.
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
import {Charselect} from '../../../server/game/character/Charselect';
import {CharselectRequest as SharedCharselectRequest} from
  '../../../shared/lib/protocol/CharselectRequest';
import {Classes} from '../../../shared/lib/class/Classes';

export class CharselectRequest extends SharedCharselectRequest
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  // ---------------- Public methods --------------------

  // ~ Overrides Packet.process().
  public async process(connection: Connection)
  {
    Charselect.processRequest(this, connection);
  }
}

// This overwrites ancestor class.
Classes.registerSerializableClass(CharselectRequest);