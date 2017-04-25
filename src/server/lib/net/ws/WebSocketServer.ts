/*
  Part of BrutusNEXT

  Implements websocket server.
*/

/*
  Implementation note:
    Event handlers need to be registered using lambda expression '() => {}'.
    For example:
      this.webSocketServer.on
      (
        'error',
        (error) => { this.onServerError(error); }
      );
    The reason is, that it is not guaranteed in TypeScript that class
    methods will get called on an instance of their class. In other words,
    'this' will be something else than you expect when you register an event
    handler.
      Lambda expression solves this by capturing 'this', so you may use it
    correcly within lambda function body.
*/

'use strict';

import {FATAL_ERROR} from '../../../../shared/lib/error/FATAL_ERROR';
import {Syslog} from '../../../../shared/lib/log/Syslog';
import {AdminLevel} from '../../../../shared/lib/admin/AdminLevel';
import {MessageType} from '../../../../shared/lib/message/MessageType';
import {ServerApp} from '../../../../server/lib/ServerApp';
import {Connection} from '../../../../server/lib/connection/Connection';
import {HttpServer} from '../../../../server/lib/net/http/HttpServer';
import {WebSocketDescriptor} from
  '../../../../server/lib/net/ws/WebSocketDescriptor';

import * as WebSocket from 'ws';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js.
import * as events from 'events';  // Import namespace 'events' from node.js.
import * as http from 'http';  // Import namespace 'http' from node.js.

export class WebSocketServer
{
  // ----------------- Public data ----------------------

  // Do we accept new connections?
  public isOpen = false;

  //------------------ Private data ---------------------

  private webSocketServer: WebSocket.Server = null;

  // ---------------- Public methods --------------------

  // Starts the websocket server inside a http server.
  public start(httpServer: http.Server)
  {
    Syslog.log
    (
      "Starting websocket server",
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    // Websocket server runs inside a http server so the same port can be used
    // (it is possible because WebSocket protocol is an extension of http).
    this.webSocketServer = new WebSocket.Server({ server: httpServer });

    this.webSocketServer.on
    (
      'connection',
      (socket) => { this.onNewConnection(socket); }
    );

    // Unlike telnet server, websocket server is up immediately,
    // so we don't have to register handler for 'listening' event
    // (in fact, there is no such event on websocket server).
    //   But since the websocket server runs inside a http server,
    // it must be started after onStartListening() is fired on http
    // server.
    Syslog.log
    (
      "Websocket server is up and listening to new connections",
      MessageType.WEBSOCKET_SERVER,
      AdminLevel.IMMORTAL
    );

    this.isOpen = true;
  }

  // ---------------- Event handlers --------------------

  private async onNewConnection(socket: WebSocket)
  {
    let ip = WebSocketDescriptor.parseRemoteAddress(socket);
    let url = WebSocketDescriptor.parseRemoteUrl(socket);

    if (!this.isServerOpen(socket, ip, url))
      return;

    Syslog.log
    (
      "Received a new websocket connection request from"
      + " " + url + " (" + ip + ")",
      MessageType.WEBSOCKET_SERVER,
      AdminLevel.IMMORTAL
    );

    let connection = await this.createConnection(socket, ip, url);

    if (connection === null)
      // Error is already reported by createConnection().
      return;

    connection.startAuthenticating();
  }

  // ---------------- Private methods --------------------

  // -> Returns 'null' if connection couldn't be created.
  private async createConnection(socket: WebSocket, ip: string, url: string)
  {
    let socketDescriptor = new WebSocketDescriptor(socket, ip, url);

    let connection = await ServerApp.entityManager.createEntity(Connection);

    if (connection === null)
      return null;

    connection.setSocketDescriptor(socketDescriptor);
    ServerApp.connections.add(connection);

    return connection;
  }

  private isServerOpen(socket: WebSocket, ip: string, url: string)
  {
    if (this.isOpen === false)
    {
      Syslog.log
      (
        "Denying websocket connection request from"
        + " " + url + "(" + ip + "):"
        + " Server is closed",
        MessageType.WEBSOCKET_SERVER,
        AdminLevel.IMMORTAL
      );

      socket.close();

      return false;
    }

    return true;
  }
}
