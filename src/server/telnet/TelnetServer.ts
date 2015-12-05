/*
  Part of BrutusNEXT

  Implements container for connected player and their accounts.
*/

/*
  Implementation note:
    All event handlers must be static methods!
  The reason is, that it is possible in TypeScript to call a method
  on 'this' that is not an instance of the method's class. And that's
  exactly what happens when an even handler is called. So by declaring
  event handler a static method you prevent ugly errors from happening.
*/

'use strict';

import {ASSERT_FATAL} from '../../shared/ASSERT';
import {Mudlog} from '../../server/Mudlog';
import {GameServer} from '../../server/GameServer';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js
import * as events from 'events';  // Import namespace 'events' from node.js

// This constant is used to extend socket objects with new property.
const DESCRIPTOR_ID = 'descriptorId';

export class TelnetServer
{
  constructor(protected myPort: number) { }

  // ----------------- Public data ----------------------

  // Do we accept new connections?
  public open = false;

  public get port() { return this.myPort; }

  // ---------------- Public methods --------------------

  // Starts the telnet server.
  public start()
  {
    // Create a new raw socket server. Parameter is handler which will be
    // called when there is a new connection to the server.
    this.myTelnetServer = net.createServer(TelnetServer.onNewConnection);

    // Register handler for server errors (like attempt to run the server
    // on unavailable port).
    this.myTelnetServer.on
    (
      TelnetServer.events.SERVER_ERROR,
      function(error) { TelnetServer.onServerError(error); }
    );

    // Register handler to open the server to the new connections when
    // telnet server is ready (e. g. when 'listening' event is emited).
    this.myTelnetServer.on
    (
      TelnetServer.events.SERVER_STARTED_LISTENING,
      TelnetServer.onServerStartsListening
    );

    Mudlog.log(
      "Starting telnet server at port " + this.port,
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL);

    this.myTelnetServer.listen(this.port);
  }

  // -------------- Protected class data ----------------

  protected myTelnetServer: net.Server;

  protected static events =
  {
    SERVER_STARTED_LISTENING: 'listening',
    SERVER_ERROR: 'error',
    SOCKET_RECEIVED_DATA: 'data',
    SOCKET_ERROR: 'error',
    SOCKET_CLOSE: 'close'
  }

  // ---------------- Event handlers --------------------

  // Handles 'listening' event of telnet server.
  protected static onServerStartsListening()
  {
    let telnetServer = GameServer.getInstance().telnetServer;

    telnetServer.open = true;
    Mudlog.log(
      "Telnet server is up and listening to the new connections",
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL);
  }

  // Handles 'error' event of telnet server.
  protected static onServerError(error)
  {
    let port = GameServer.getInstance().telnetServer.port;

    if (error.code === 'EADDRINUSE')
    {
      ASSERT_FATAL(false,
        "Cannot start telnet server on port "
        + port + ": Address is already in use.\n"
        + "Do you have a MUD server already running?");
    }

    if (error.code === 'EACCES')
    {
      ASSERT_FATAL(false,
        "Cannot start telnet server on port "
        + port + ": Permission denied.\n"
        + "Are you trying to start it on a priviledged port without"
        + " being root?");
    }

    ASSERT_FATAL(false,
      "Cannot start telnet server on port "
      + port + ": Unknown error");
  }

  // This handler is registered directly by net.createServer()
  // (it processes a new connection request)
  protected static onNewConnection(socket: net.Socket)
  {
    let descriptorManager = GameServer.getInstance().descriptorManager;
    let telnetServer = GameServer.getInstance().telnetServer;

    Mudlog.log(
      "TELNET SERVER: Received a new connection request from "
      + socket.remoteAddress,
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL);

    if (!telnetServer.open)
    {
      Mudlog.log(
        "TELNET SERVER: Denying connection request: Server is closed",
        Mudlog.msgType.SYSTEM_INFO,
        Mudlog.levels.IMMORTAL);

      // Half - closes the socket. i.e., it sends a FIN packet.
      // It is possible the server will still send some data.
      socket.end();

      return;
    }
    /// Tady by se asi resil IP ban. Zatim si to tu necham
    /*
        if (server.isBanned(s.remoteAddress, 'IP')) {
          log(' (ws): connection from ' + s.remoteAddress + ' rejected (banned).');
          return s.end();
        }
    */

    /// Nevim, k cemu je tohle dobre, ale mozna to bude potreba, aby se dalo
    /// k obyc socketum pristupovat stejne jako k websocketum, tak si to tu
    /// zatim necham.
    ///s.socket = s; // conform to the websocket object to make easier to handle

    TelnetServer.initTelnetSocket(socket);

    // Let SocketManager create a new socket descriptor. Remember it's unique
    // string id.
    let socketDescriptorId: string =
      descriptorManager.addSocketDescriptor(socket);

    // Here we are extending socket object with our custom property (that's
    // why we use [] brackets).
    //   We store socketDescriptorId in socket object in order to know which
    // player does this socket belong to (if any) when socket events (like
    // receiving data) are processed.
    socket[DESCRIPTOR_ID] = socketDescriptorId;

    descriptorManager.getSocketDescriptor(socketDescriptorId)
      .startLoginProcess();
  }

  protected static onSocketReceivedData(socket: net.Socket, data: string)
  {
    let gameServer = GameServer.getInstance();

    console.log("onSocketReceivedData(): " + data);

    // Here we are accessing our custom property that we dynamically
    // added to our socket (that's the reason for [] brackets).
    ASSERT_FATAL(socket[DESCRIPTOR_ID] !== undefined,
      "Missing property '" + DESCRIPTOR_ID + "' on socket");
    gameServer.descriptorManager.getSocketDescriptor(
      socket[DESCRIPTOR_ID]).socketReceivedData(data);
  }

  protected static onSocketError(socket: net.Socket, error)
  {
    let descriptorManager = GameServer.getInstance().descriptorManager;

    // I don't really know what kind of errors can happen here.
    // For now let's just log the error and close the connection.
    Mudlog.log(
      "Socket error occured, closing the connection: " + error,
      Mudlog.msgType.SYSTEM_ERROR,
      Mudlog.levels.IMMORTAL);

    // Here we are accessing our custom property that we dynamically
    // added to our socket (that's the reason for [] brackets).
    ASSERT_FATAL(socket[DESCRIPTOR_ID] !== undefined,
      "Missing property '" + DESCRIPTOR_ID + "' on socket");
    descriptorManager.socketError(socket[DESCRIPTOR_ID]);
  }

  protected static onSocketClose(socket: net.Socket)
  {
    let descriptorManager = GameServer.getInstance().descriptorManager;

    // Here we are accessing our custom property that we dynamically
    // added to our socket (that's the reason for [] brackets).
    ASSERT_FATAL(socket[DESCRIPTOR_ID] !== undefined,
      "Missing property '" + DESCRIPTOR_ID + "' on socket");
    descriptorManager.socketClose(socket[DESCRIPTOR_ID]);
  }

  // ---------- Auxiliary protected methods -------------

  protected static checkEventHandlerAbsence(socket: net.Socket, event: string)
  {
    let registeredEvents =
      events.EventEmitter.listenerCount(socket, event);
    ASSERT_FATAL(registeredEvents === 0,
      "Event " + event + " is already registered on socket");
  }

  // Sets socket transfer mode, registers event handlers, etc.
  protected static initTelnetSocket(socket: net.Socket)
  {
    let gameServer = GameServer.getInstance();

    // Tell the socket to interpret data as raw binary stream.
    socket.setEncoding('binary');

    // Check that event handler for 'data' event is not already registered.
    TelnetServer.checkEventHandlerAbsence(
      socket, TelnetServer.events.SOCKET_RECEIVED_DATA);

    // Register event handler for 'data' event.
    socket.on
    (
      TelnetServer.events.SOCKET_RECEIVED_DATA,
      function(data) { TelnetServer.onSocketReceivedData(socket, data); }
    );

    // Check that event handler for 'error' event is not already registered.
    TelnetServer.checkEventHandlerAbsence(
      socket, TelnetServer.events.SOCKET_ERROR);

    // Register event handler for 'error' event.
    socket.on
    (
      TelnetServer.events.SOCKET_ERROR,
      function(error) { TelnetServer.onSocketError(socket, error); }
    );

    // Check that event handler for 'close' event is not already registered.
    TelnetServer.checkEventHandlerAbsence(
      socket, TelnetServer.events.SOCKET_CLOSE);

    // Register event handler for 'close' event.
    socket.on
    (
      TelnetServer.events.SOCKET_CLOSE,
      function() { TelnetServer.onSocketClose(socket); }
    );
  }
}
