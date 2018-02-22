/*
  Part of BrutusNEXT

  Container storing id's of entities.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Admins} from '../../../server/lib/admin/Admins';
import {Connection} from '../../../server/lib/connection/Connection';
import {Message} from '../../../server/lib/message/Message';
import {ServerApp} from '../../../server/lib/app/ServerApp';

export class Connections
{
  // ----------------- Private data ---------------------

  private connectionList = new Set<Connection>();

  // ------------- Public static methods ----------------

  public static add(connection: Connection)
  {
    if (ServerApp.connections.connectionList.has(connection))
    {
      ERROR("Attempt to add connection which already "
        + " exists in Connections");
      return;
    }

    ServerApp.connections.connectionList.add(connection);
  }

  public static release(connection: Connection)
  {
    if (!ServerApp.connections.connectionList.has(connection))
    {
      ERROR("Attempt to release connection which doesn't"
        + " exist in Connections");
      return;
    }

    ServerApp.connections.connectionList.delete(connection);
  }

  // Sends a message to all connections.
  // If 'visibility' is not 'null', message is only sent to connections
  // with valid ingame entity with sufficient AdminLevel.
  public static send(message: Message, visibility: (AdminLevel | null) = null)
  {
    for (let connection of ServerApp.connections.connectionList)
    {
      if (visibility !== null)
      {
        if (!connection.ingameEntity || !connection.ingameEntity.isValid())
          continue;

        const adminLevel = Admins.getAdminLevel(connection.ingameEntity);

        if (adminLevel === null)
        {
          ERROR("Unexpected 'null' value");
          continue;
        }

        // Skip game entities that don't have sufficient admin level
        // to see this message.
        if (adminLevel < visibility)
          continue;
      }

      message.sendToConnection(connection);
    }
  }

  // ------------- Private static methods --------------- 

}