/*
  Part of BrutusNext

  List of player connections
*/

// import { Packet } from "../../Shared/Protocol/Packet";
import { Connection } from "../../Server/Net/Connection";

// 3rd party modules.
// Use 'isomorphic-ws' to use the same code on both client and server.
import * as WebSocket from "isomorphic-ws";

const connections = new Set<Connection>();

export namespace Connections
{
// // TODO: Na co se tohle používá? Má to bejt public?
// // ! Throws exception on error.
// export function removeConnection(connection: Connection): void
// {
//   if (!connections.has(connection))
//   {
//     throw Error(`Attempt to release connection`
//       + ` ${connection.getPlayerInfo()} which doesn't exist`);
//   }

//   connections.delete(connection);
// }

  export function newConnection
  (
    webSocket: WebSocket,
    ip: string,
    url: string
  )
  : Connection
  {
    const connection = new Connection(webSocket, ip, url);

    connections.add(connection);

    return connection;
  }

  // ! Throws exception on error.
// export function broadcast(packet: Packet): void
// {
//   for (const connection of connections)
//   {
//     if (connection.isOpen())
//       // ! Throws exception on error.
//       sendPacket(connection, packet);
//   }
// }

// // ! Throws exception on error.
// export function updateClients(): void
// {
//   for (const connection of connections)
//   {
//     if (connection.isOpen())
//     {
//       // ! Throws exception on error.
//       connection.updateClient();
//     }
//   }
// }
}

// ----------------- Auxiliary Functions ---------------------

// // ! Throws exception on error.
// function sendPacket(connection: Connection, packet: Packet): void
// {
//   try
//   {
//     connection.send(packet);
//   }
//   catch (error)
//   {
//     RETHROW(error, `Failed to send packet`
//       + ` to connection ${connection.debugId}`);
//   }
// }