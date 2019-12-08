/*  Part of Kosmud  */

import { REPORT } from "../../Shared/Log/REPORT";
import { ERROR } from "../../Shared/Log/ERROR";
import { Syslog } from "../../Server/Log/Syslog";
import { Connection } from "../../Server/Net/Connection";
import { Connections } from "../../Server/Net/Connections";

// 3rd party modules.
// Use 'isomorphic-ws' to use the same code on both client and server.
import * as WebSocket from "isomorphic-ws";

// Built-in node.js modules.
import * as http from "http";  // Import namespace 'http' from node.js.
import * as https from "https";  // Import namespace 'http' from node.js.

export class WebSocketServer
{
  // ----------------- Private data ---------------------

  // Do we accept new connections?
  private open = false;

  private webSocketServer: (WebSocket.Server | "Not running") = "Not running";

  // ---------------- Public methods --------------------

  public isOpen() { return this.open; }

  // ! Throws exception on error.
  public startInsideHttpsServer(httpsServer: https.Server)
  {
    if (this.webSocketServer !== "Not running")
    {
      throw Error("Failed to start websocket server"
        + " because it's already running");
    }

    Syslog.log("[INFO]", "Starting websocket server");

    this.webSocketServer = new WebSocket.Server({ server: httpsServer });

    this.webSocketServer.on
    (
      "connection",
      async (socket, request) =>
      {
        await this.onNewConnection(socket, request);
      }
    );

    // Unlike http server websocket server is up immediately so
    // we don't have to register handler for 'listening' event
    // (in fact, there is no such event on websocket server).
    //   But since the websocket server runs inside a http server,
    // it must be started after onStartListening() is fired on http
    // server.
    Syslog.log("[WEBSOCKET_SERVER]", `Websocket server is up and listening`);

    this.open = true;
  }

  // ---------------- Event handlers --------------------

  private async onNewConnection
  (
    webSocket: WebSocket,
    request: http.IncomingMessage
  )
  {
    const ip = parseAddress(request);
    const url = request.url;

    // Request.url is only valid for requests obtained from http.Server
    // (which should be our case).
    if (url === undefined)
    {
      ERROR("Invalid 'request.url'. This probably means that"
        + " websocket server is used outside of http server."
        + " Connection is denied");

      denyConnection(webSocket, "Invalid request.url", ip);
      return;
    }

    if (!this.isOpen())
    {
      denyConnection(webSocket, "Server is closed", ip, url);
      return;
    }

    try
    {
      acceptConnection(webSocket, ip, url);
    }
    catch (error)
    {
      Syslog.reportUncaughtException(error);
    }
  }
}

// ----------------- Auxiliary Functions ---------------------

function parseAddress(request: http.IncomingMessage)
{
  if (request.connection.remoteAddress === undefined)
    return "Unknown ip address";

  return request.connection.remoteAddress;
}

function acceptConnection(webSocket: WebSocket, ip: string, url: string)
{
  let connection: Connection;

  try
  {
    connection = Connections.newConnection(webSocket, ip, url);
  }
  catch (error)
  {
    REPORT(error, "Failed to accept connection");
    return;
  }

  Syslog.log("[WEBSOCKET_SERVER]", `Accepting`
    + ` connection ${connection.getOrigin()}`);
}

function denyConnection
(
  socket: WebSocket,
  reason: string,
  ip: string,
  url?: string
)
{
  const address = (url !== undefined) ? `(${url} [${ip}])` : `[${ip}]`;

  Syslog.log("[WEBSOCKET_SERVER]", `Denying`
    + ` connection ${address}: ${reason}`);

  socket.close();
}