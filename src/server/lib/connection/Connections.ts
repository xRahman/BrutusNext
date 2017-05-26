/*
  Part of BrutusNEXT

  Container storing id's of entities.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Connection} from '../../../server/lib/connection/Connection';
import {Message} from '../../../server/lib/message/Message';
import {ServerApp} from '../../../server/lib/app/ServerApp';

export class Connections
{
  //------------------ Private data ---------------------

  private connections = new Set<Connection>();

  // ------------- Public static methods ----------------

  public static add(connection: Connection)
  {
    let connections = ServerApp.getConnections().connections;

    if (!connections)
      return;

    if (connections.has(connection))
    {
      ERROR("Attempt to add connection which already "
        + " exists in Connections");
      return;
    }

    connections.add(connection);
  }

  public static release(connection: Connection)
  {
    let connections = ServerApp.getConnections().connections;

    if (!connections)
      return;

    if (!connections.has(connection))
    {
      ERROR("Attempt to release connection which doesn't"
        + " exist in Connections");
      return;
    }

    connections.delete(connection);
  }

  // Sends a message to all connections.
  // If 'visibility' is not 'null', message is only sent to connections
  // with valid ingame entity with sufficient AdminLevel.
  public static send(message: Message, visibility: AdminLevel = null)
  {
    let connections = ServerApp.getConnections().connections;

    if (!connections)
      return;

    for (let connection of connections)
    {
      if (visibility !== null)
      {
        if (!Entity.isValid(connection.ingameEntity))
          continue;

        // Skip game entities that don't have sufficient admin level
        // to see this message.
        if (ServerApp.getAdminLevel(connection.ingameEntity) < visibility)
          continue;
      }

      message.sendToConnection(connection);
    }
  }

  // ------------- Private static methods --------------- 

}