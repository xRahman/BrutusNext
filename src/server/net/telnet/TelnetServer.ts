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

import {FATAL_ERROR} from '../../../shared/error/FATAL_ERROR';
import {Syslog} from '../../../server/Syslog';
import {AdminLevel} from '../../../server/AdminLevel';
import {Server} from '../../../server/Server';
import {Connection} from '../../../server/connection/Connection';
import {TelnetSocketDescriptor}
  from '../../../server/net/telnet/TelnetSocketDescriptor';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js
import * as events from 'events';  // Import namespace 'events' from node.js

export class TelnetServer
{
  constructor(protected port: number) { }

  // ----------------- Public data ----------------------

  // Do we accept new connections?
  public isOpen = false;

  // ---------------- Public methods --------------------

  public getPort() { return this.port; }

  // Starts the telnet server.
  public start()
  {
    // Create a new raw socket server. Parameter is handler which will be
    // called when there is a new connection request.
    // (Handler is called using lambda expression (() => {}) to ensure that
    // corect 'this' will be passed to it. )
    this.telnetServer =
      net.createServer((socket) => { this.onNewConnection(socket); });

    // Register handler for server errors (like attempt to run the server
    // on unavailable port).
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
      Syslog.msgType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    this.telnetServer.listen(this.port);
  }

  // -------------- Protected class data ----------------

  protected telnetServer: net.Server;

  protected static events =
  {
    SERVER_STARTED_LISTENING: 'listening',
    SERVER_ERROR: 'error',
  }

  // ---------------- Event handlers --------------------

  // Handles 'listening' event of telnet server.
  protected onServerStartsListening()
  {
    this.isOpen = true;

    Syslog.log
    (
      "Telnet server is up and listening to the new connections",
      Syslog.msgType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );
  }

  // Handles 'error' event of telnet server.
  protected onServerError(error)
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
  protected onNewConnection(socket: net.Socket)
  {
    Syslog.log
    (
      "TELNET SERVER: Received a new connection request from "
      + socket.remoteAddress,
      Syslog.msgType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    if (!this.isOpen)
    {
      Syslog.log
      (
        "TELNET SERVER: Denying connection request: Server is closed",
        Syslog.msgType.SYSTEM_INFO,
        AdminLevel.IMMORTAL
      );

      // Half - closes the socket. i.e., it sends a FIN packet.
      // It is possible the server will still send some data.
      socket.end();

      return;
    }

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

    let connection = this.createConnection(socket);
    
    
    connection.startLoginProcess();
  }

  private createConnection(socket)
  {
    let socketDescriptor = new TelnetSocketDescriptor(socket);

    let connection = Server.entityManager.createEntity
    (
      'Connection',
      Connection
    );

    connection.setSocketDescriptor(socketDescriptor);

    /*
    let connection = new Connection(socketDescriptor);

    let id = Server.idProvider.createId(connection);
    */

    Server.connections.add(connection);

    return connection;
  }
}
