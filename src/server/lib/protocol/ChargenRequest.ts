/*
  Part of BrutusNEXT

  Server-side functionality related to character creation request packet.
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
import {Chargen} from '../../../server/game/character/Chargen';
import {ChargenRequest as SharedChargenRequest} from
  '../../../shared/lib/protocol/ChargenRequest';
import {Classes} from '../../../shared/lib/class/Classes';

export class ChargenRequest extends SharedChargenRequest
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
    Chargen.processRequest(this, connection);
  }
}

// This overwrites ancestor class.
Classes.registerSerializableClass(ChargenRequest);