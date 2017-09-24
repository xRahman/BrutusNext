/*
  Part of BrutusNEXT

  Server-side functionality related to account creation request packet.
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
import {Register} from '../../../server/lib/account/Register';
import {RegisterRequest as SharedRegisterRequest} from
  '../../../shared/lib/protocol/RegisterRequest';
import {Classes} from '../../../shared/lib/class/Classes';

export class RegisterRequest extends SharedRegisterRequest
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
    Register.processRequest(this, connection);
  }
}

// This overwrites ancestor class.
Classes.registerSerializableClass(RegisterRequest);