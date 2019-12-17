/*
  Part of BrutusNext

  WebSocket server
*/

/*
  WebSocket server is running inside a https server so we don't
  need an extra port for WebSocket communication (it's going over
  https port) and it enjoys the perks of https security.
*/

import { REPORT } from "../../Shared/Log/REPORT";
import { ERROR } from "../../Shared/Log/ERROR";
import { Syslog } from "../../Server/Log/Syslog";
import { Connections } from "../../Server/Net/Connections";

// Node.js modules.
import * as http from "http";
import * as https from "https";

// 3rd party modules.
// Use 'isomorphic-ws' to use the same code on both client and server.
import * as WebSocket from "isomorphic-ws";

let webSocketServer: (WebSocket.Server | "Not running") = "Not running";

const status =
{
  // Do we accept new connections?
  isOpen: true
};

export namespace WebSocketServer
{
  export function isOpen(): boolean { return status.isOpen; }

  export function open(): void
  {
    status.isOpen = true;

    Syslog.log
    (
      "[WEBSOCKET_SERVER]",
      "WebSocket server is now open. It will accept connections"
    );
  }

  export function close(): void
  {
    status.isOpen = false;

    Syslog.log
    (
      "[WEBSOCKET_SERVER]",
      "WebSocket server is now closed. It won't accept any connections"
    );
  }

  // ! Throws exception on error.
  export function startInHttpsServer(httpsServer: https.Server): void
  {
    if (webSocketServer !== "Not running")
    {
      throw Error("Failed to start websocket server"
        + " because it's already running");
    }

    Syslog.log("[WEBSOCKET_SERVER]", "Starting websocket server");

    webSocketServer = new WebSocket.Server({ server: httpsServer });

    webSocketServer.on
    (
      "connection",
      (socket, request) => { onNewConnection(socket, request); }
    );

    status.isOpen = true;

    // Unlike http server websocket server is up immediately so
    // we don't have to register handler for 'listening' event
    // (in fact, there is no such event on websocket server).
    //  But since the websocket server runs inside a https server,
    // it must be started after onStartListening() is fired on https
    // server.
    Syslog.log("[WEBSOCKET_SERVER]", `Websocket server is up and listening`);
  }
}

// ----------------- Auxiliary Functions ---------------------

function parseIpAddress(request: http.IncomingMessage): string
{
  if (request.connection.remoteAddress === undefined)
    return "Unknown ip address";

  return request.connection.remoteAddress;
}

function acceptConnection(webSocket: WebSocket, ip: string, url: string): void
{
  try
  {
    Connections.newConnection(webSocket, ip, url);

    Syslog.log("[WEBSOCKET_SERVER]", `Accepting`
      + ` connection ${composeAddress(ip, url)}`);
  }
  catch (error)
  {
    REPORT(error, `Failed to accept connection ${composeAddress(ip, url)}`);
  }
}

function denyConnection
(
  socket: WebSocket,
  reason: string,
  ip: string,
  url?: string
)
: void
{
  const address = composeAddress(ip, url);

  Syslog.log("[WEBSOCKET_SERVER]", `Denying connection ${address}: ${reason}`);

  socket.close();
}

function composeAddress(ip: string, url?: string): string
{
  if (url)
    return `[${url} (${ip})]`;

  return `[${ip}]`;
}

// ---------------- Event handlers --------------------

function onNewConnection
(
  webSocket: WebSocket,
  request: http.IncomingMessage
)
: void
{
  const ip = parseIpAddress(request);
  const url = request.url;

  // Request.url is only valid for requests obtained from http(s).Server
  // (which should be our case).
  if (url === undefined)
  {
    ERROR("Invalid 'request.url'. This probably means that"
      + " websocket server is used outside of http server."
      + " Connection is denied");

    denyConnection(webSocket, "Invalid request.url", ip);
    return;
  }

  if (!status.isOpen)
  {
    denyConnection(webSocket, "Server is closed", ip, url);
    return;
  }

  acceptConnection(webSocket, ip, url);
}