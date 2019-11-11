/*
  Part of BrutusNEXT

  Client-side functionality related to mud message packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
// import {ClientApp} from '../../../client/lib/app/ClientApp';
// import {Character} from '../../../client/game/character/Character';
// import {Account} from '../../../client/lib/account/Account';
// import {Windows} from '../../../client/gui/window/Windows';
import {Connection} from '../../../client/lib/connection/Connection';
import {SharedMudMessage} from
  '../../../shared/lib/protocol/SharedMudMessage';
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