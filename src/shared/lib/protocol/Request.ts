/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Ancestor of client request packets.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Packet} from '../../../shared/lib/protocol/Packet';

export abstract class Request extends Packet
{
  // ----------------- Private data ---------------------

  // --------------- Public accessors -------------------

  // -------------- Protected methods -------------------

  protected logConnectionInfo(message: string)
  {
    Syslog.log
    (
      message,
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
  }

  protected logSystemInfo(message: string)
  {
    Syslog.log
    (
      message,
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );
  }
}

// ------------------ Type declarations ----------------------

export module Request
{
  export interface Problems
  {
    // Any number of optional string properties.
    [key: string]: string | undefined
  }
}