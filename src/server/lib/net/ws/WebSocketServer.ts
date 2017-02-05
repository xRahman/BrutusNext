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

import {FATAL_ERROR} from '../../../../server/lib/error/FATAL_ERROR';
import {Syslog} from '../../../../server/lib/log/Syslog';
import {AdminLevel} from '../../../../server/lib/admin/AdminLevel';
import {Message} from '../../../../server/lib/message/Message';
import {Server} from '../../../../server/lib/Server';
import {Connection} from '../../../../server/lib/connection/Connection';
import {WebSocketDescriptor} from
  '../../../../server/lib/net/ws/WebSocketDescriptor';

import * as WebSocket from 'ws';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js
import * as events from 'events';  // Import namespace 'events' from node.js

export class WebSocketServer
{
  constructor(protected port: number) { }

  // ----------------- Public data ----------------------

  // Do we accept new connections?
  public isOpen = false;

  //------------------ Private data ---------------------

  private webSocketServer: WebSocket.Server = null;

  private static events =
  {
    NEW_CONNECTION: 'connection',
    SERVER_STARTED_LISTENING: 'listening',
    SERVER_ERROR: 'error'
  }

  // ---------------- Public methods --------------------

  public getPort() { return this.port; }

  // Starts the websocket server.
  public start()
  {
    Syslog.log
    (
      "Starting websocket server at port " + this.port,
      Message.Type.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    this.webSocketServer = new WebSocket.Server({ port: 4442 });

    this.webSocketServer.on
    (
      'connection',
      (socket) => { this.onNewConnection(socket); }
    );

    // Unlike telnet server, websocket werver is (probably) up immediately,
    // so we don't have to register handler for 'listening' event
    // (in fact, there is no such event on websocket server).
    Syslog.log
    (
      "Websocket server is up and listening to new connections",
      Message.Type.WEBSOCKET_SERVER,
      AdminLevel.IMMORTAL
    );

    this.isOpen = true;

    /*
    // Create a new raw socket server. Parameter is handler which will be
    // called when there is a new connection request.
    // (Handler is called using lambda expression (() => {}) to ensure that
    // corect 'this' will be passed to it. )
    this.telnetServer = net.createServer
    (
      (socket) => { this.onNewConnection(socket); }
    );

    // Register handler for server errors (like attempt to run the server
    // on an unavailable port).
    this.telnetServer.on
    (
      TelnetServer.events.SERVER_ERROR,
      (error) => { this.onServerError(error); }
    );

    // Register handler to open the server to the new connections when
    // telnet server is ready (when 'listening' event is emited).
    this.telnetServer.on
    (
      TelnetServer.events.SERVER_STARTED_LISTENING,
      () => { this.onServerStartsListening(); }
    );

    Syslog.log
    (
      "Starting telnet server at port " + this.port,
      Message.Type.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    this.telnetServer.listen(this.port);
    */
  }
  

  // ---------------- Event handlers --------------------

  /*
  // Handles 'listening' event of telnet server.
  private onServerStartsListening()
  {
    this.isOpen = true;

    Syslog.log
    (
      "Telnet server is up and listening to new connections",
      Message.Type.TELNET_SERVER,
      AdminLevel.IMMORTAL
    );
  }

  // Handles 'error' event of telnet server.
  private onServerError(error)
  {
    switch (error.code)
    {
      case 'EADDRINUSE':
        FATAL_ERROR("Cannot start telnet server on port"
          + " " + this.port + ": Address is already in use.\n"
          + " Do you have a MUD server already running?");
        break;

      case 'EACCES':
        FATAL_ERROR("Cannot start telnet server on port"
          + " " + this.port + ": Permission denied.\n"
          + " Maybe you are trying to start it on a priviledged"
          + " port without being root?");
        break;

      default:
        FATAL_ERROR("Cannot start telnet server on port"
          + " " + this.port + ": Unknown error");
        break;
    }
  }

  // This handler is registered directly by net.createServer()
  // (it processes a new connection request)
  private async onNewConnection(socket: net.Socket)
  {
    Syslog.log
    (
      "Received a new connection request from"
      + " " + socket.remoteAddress,
      Message.Type.TELNET_SERVER,
      AdminLevel.IMMORTAL
    );

    if (!this.isServerOpen(socket))
      return;

    /// Tady by se asi resil IP ban. Zatim si to tu necham
        // if (this.isBanned(s.remoteAddress, 'IP')) {
        //   log('connection from ' + s.remoteAddress + ' rejected (banned).');
        //   return;
        // }

    /// Nevim, k cemu je tohle dobre, ale mozna to bude potreba, aby se dalo
    /// k obyc socketum pristupovat stejne jako k websocketum, tak si to tu
    /// zatim necham.
    ///s.socket = s; // conform to the websocket object to make easier to handle

    let connection = await this.createConnection(socket);

    if (connection === null)
      // Error is already reported by createConnection().
      return;
    
    connection.startAuthenticating();
  }
  */

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
      Message.Type.WEBSOCKET_SERVER,
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

    let connection = await Server.entityManager.createEntity(Connection);

    if (connection === null)
      return null;

    connection.setSocketDescriptor(socketDescriptor);
    Server.connections.add(connection);

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
        Message.Type.WEBSOCKET_SERVER,
        AdminLevel.IMMORTAL
      );

      socket.close();

      return false;
    }

    return true;
  }
}
