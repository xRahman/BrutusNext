/*
  Part of BrutusNEXT

  Client-side functionality related to mud message packet.
*/

/*
  Note:
    This class needs to use the same name as it's ancestor in /shared,
  because class name of the /shared version of the class is written to
  serialized data on the server and is used to create /client version
  of the class when deserializing the packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
// import {ClientApp} from '../../../client/lib/app/ClientApp';
// import {Character} from '../../../client/game/character/Character';
// import {Account} from '../../../client/lib/account/Account';
// import {Windows} from '../../../client/gui/window/Windows';
import {Connection} from '../../../client/lib/connection/Connection';
import {MudMessage as SharedMudMessage} from
  '../../../shared/lib/protocol/MudMessage';
import {Classes} from '../../../shared/lib/class/Classes';

export class MudMessage extends SharedMudMessage
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
    connection.receiveMudMessage(this.message);
  }
}

Classes.registerSerializableClass(MudMessage);