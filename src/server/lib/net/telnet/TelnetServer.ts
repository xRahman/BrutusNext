/*
  Part of BrutusNEXT

  Implements telnet server.
*/

/*
  Implementation note:
    Event handlers need to be registered using lambda expression '() => {}'.
    For example:
      this.telnetServer.on
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
import {ServerApp} from '../../../../server/lib/app/ServerApp';
import {Connection} from '../../../../server/lib/connection/Connection';
import {TelnetSocketDescriptor} from
  '../../../../server/lib/net/telnet/TelnetSocketDescriptor';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js
import * as events from 'events';  // Import namespace 'events' from node.js

export class TelnetServer
{
  // ----------------- Public data ----------------------

  // Do we accept new connections?
  public isOpen = false;

  public static get DEFAULT_PORT() { return 4443; }

  //------------------ Private data ---------------------

  private port = TelnetServer.DEFAULT_PORT;

  private telnetServer: net.Server;

  private static events =
  {
    SERVER_STARTED_LISTENING: 'listening',
    SERVER_ERROR: 'error',
  }

  // ---------------- Public methods --------------------

  public getPort() { return this.port; }

  // Starts the telnet server.
  public start(port: number = TelnetServer.DEFAULT_PORT)
  {
    this.port = port;

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
      "Starting telnet server at port " + port,
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    this.telnetServer.listen(port);
  }

  // ---------------- Event handlers --------------------

  // Handles 'listening' event of telnet server.
  private onServerStartsListening()
  {
    this.isOpen = true;

    Syslog.log
    (
      "Telnet server is up and listening to new connections",
      MessageType.TELNET_SERVER,
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
    let ip = TelnetSocketDescriptor.parseRemoteAddress(socket);

    if (!this.isServerOpen(socket, ip))
      return;

    Syslog.log
    (
      "Received a new telnet connection request from " + ip,
      MessageType.TELNET_SERVER,
      AdminLevel.IMMORTAL
    );

    /// Tady by se asi resil IP ban. Zatim si to tu necham
    /*
        if (this.isBanned(s.remoteAddress, 'IP')) {
          log('connection from ' + s.remoteAddress + ' rejected (banned).');
          return;
        }
    */

    /// Nevim, k cemu je tohle dobre, ale mozna to bude potreba, aby se dalo
    /// k obyc socketum pristupovat stejne jako k websocketum, tak si to tu
    /// zatim necham.
    ///s.socket = s; // conform to the websocket object to make easier to handle

    let connection = await this.createConnection(socket, ip);

    if (connection === null)
      // Error is already reported by createConnection().
      return;
    
    connection.startAuthenticating();
  }

  // ---------------- Private methods --------------------

  // -> Returns 'null' if connection couldn't be created.
  private async createConnection(socket: net.Socket, ip: string)
  {
    let socketDescriptor = new TelnetSocketDescriptor(socket, ip);

    let connection = await ServerApp.entityManager.createEntity(Connection);

    if (connection === null)
      return null;

    connection.setSocketDescriptor(socketDescriptor);
    ServerApp.connections.add(connection);

    return connection;
  }

  private isServerOpen(socket: net.Socket, ip: string)
  {
    if (this.isOpen === false)
    {
      Syslog.log
      (
        "Denying telnet connection request from" + ip + ":"
        + " Server is closed",
        MessageType.TELNET_SERVER,
        AdminLevel.IMMORTAL
      );

      // Half-closes the socket by sending a FIN packet.
      // It is possible the server will still send some data.
      socket.end();

      return false;
    }

    return true;
  }
}
