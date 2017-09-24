/*
  Part of BrutusNEXT

  Server-side functionality related to system message packet.
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
import {Syslog} from '../../../shared/lib/log/Syslog';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Connection} from '../../../server/lib/connection/Connection';
import {SystemMessage as SharedSystemMessage} from
  '../../../shared/lib/protocol/SystemMessage';
import {Classes} from '../../../shared/lib/class/Classes';

export class SystemMessage extends SharedSystemMessage
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
    switch (this.type)
    {
      case SystemMessage.Type.UNDEFINED:
        ERROR("Received system message with unspecified type."
          + " Someone problably forgot to set 'packet.type'"
          + " when sending system message from the client");
        break;

      case SystemMessage.Type.CLIENT_CLOSED_BROWSER_TAB:
        this.reportClientClosedBrowserTab(connection);
        break;

      default:
        ERROR("Received system message of unknown type.");
        break;
    }
  }

  // --------------- Private methods --------------------

  private reportClientClosedBrowserTab(connection: Connection)
  {
    Syslog.log
    (
      connection.getUserInfo() + " has disconnected by"
        + " closing or reloading browser tab",
      MessageType.CONNECTION_INFO,
      AdminLevel.IMMORTAL
    );
  }
}

// This overwrites ancestor class.
Classes.registerSerializableClass(SystemMessage);