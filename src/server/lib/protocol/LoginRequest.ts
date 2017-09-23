/*
  Part of BrutusNEXT

  Server-side functionality related to login request packet.
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
import {Login} from '../../../server/lib/account/Login';
import {LoginRequest as SharedLoginRequest} from
  '../../../shared/lib/protocol/LoginRequest';
import {Classes} from '../../../shared/lib/class/Classes';

export class LoginRequest extends SharedLoginRequest
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // ----------------- Public data ----------------------

  // ---------------- Public methods --------------------

  public async process(connection: Connection)
  {
    Login.processRequest(this, connection);
  }
}

// This overwrites ancestor class.
Classes.registerSerializableClass(LoginRequest);