/*
  Part of BrutusNEXT

  Implements container for connected player and their accounts.
*/

/*
  Implementation note:
    Event handleds need to be registered using lambda expression '() => {}'.
    For example:
      this.myTelnetServer.on
      (
        'error',
        (error) => { this.onServerError(error); }
      );
    The reason is, that it is not guaranteed that in TypeScript that class
    methods will get called on an instance of their class. In other words,
    'this' will be something else than you expect when you register an event
    handler.
      Lambda expression solves this by capturing 'this', so you may use it
    correcly within lambda function body.
*/

'use strict';

import {ASSERT_FATAL} from '../../shared/ASSERT';
import {Mudlog} from '../../server/Mudlog';
import {GameServer} from '../../server/GameServer';
import {DescriptorManager} from '../../server/DescriptorManager';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js
import * as events from 'events';  // Import namespace 'events' from node.js

// This constant is used to extend socket objects with new property.
const DESCRIPTOR_ID = 'descriptorId';

export class TelnetServer
{
  constructor(protected myPort: number,
              protected myDescriptorManager: DescriptorManager) { }

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
    this.myTelnetServer =
      net.createServer((socket) => { this.onNewConnection(socket); });

    // Register handler for server errors (like attempt to run the server
    // on unavailable port).
    this.myTelnetServer.on
    (
      TelnetServer.events.SERVER_ERROR,
      (error) => { this.onServerError(error); }
    );

    // Register handler to open the server to the new connections when
    // telnet server is ready (e. g. when 'listening' event is emited).
    this.myTelnetServer.on
    (
      TelnetServer.events.SERVER_STARTED_LISTENING,
      () => { this.onServerStartsListening(); }
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
  protected onServerStartsListening()
  {
    this.open = true;
    Mudlog.log(
      "Telnet server is up and listening to the new connections",
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL);
  }

  // Handles 'error' event of telnet server.
  protected onServerError(error)
  {
    if (error.code === 'EADDRINUSE')
    {
      ASSERT_FATAL(false,
        "Cannot start telnet server on port "
        + this.port + ": Address is already in use.\n"
        + "Do you have a MUD server already running?");
    }

    if (error.code === 'EACCES')
    {
      ASSERT_FATAL(false,
        "Cannot start telnet server on port "
        + this.port + ": Permission denied.\n"
        + "Are you trying to start it on a priviledged port without"
        + " being root?");
    }

    ASSERT_FATAL(false,
      "Cannot start telnet server on port "
      + this.port + ": Unknown error");
  }

  // This handler is registered directly by net.createServer()
  // (it processes a new connection request)
  protected onNewConnection(socket: net.Socket)
  {
    Mudlog.log(
      "TELNET SERVER: Received a new connection request from "
      + socket.remoteAddress,
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL);

    if (!this.open)
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

    this.initTelnetSocket(socket);

    // Let SocketManager create a new socket descriptor. Remember it's unique
    // string id.
    let socketDescriptorId: string =
      this.myDescriptorManager.addSocketDescriptor(socket);

    // Here we are extending socket object with our custom property (that's
    // why we use [] brackets).
    //   We store socketDescriptorId in socket object in order to know which
    // player does this socket belong to (if any) when socket events (like
    // receiving data) are processed.
    socket[DESCRIPTOR_ID] = socketDescriptorId;

    this.myDescriptorManager.getSocketDescriptor(socketDescriptorId)
      .startLoginProcess();
  }

  protected onSocketReceivedData(socket: net.Socket, data: string)
  {
    console.log("onSocketReceivedData(): " + data);

    // Here we are accessing our custom property that we dynamically
    // added to our socket (that's the reason for [] brackets).
    ASSERT_FATAL(socket[DESCRIPTOR_ID] !== undefined,
      "Missing property '" + DESCRIPTOR_ID + "' on socket");
    this.myDescriptorManager.getSocketDescriptor(socket[DESCRIPTOR_ID])
      .socketReceivedData(data);
  }

  protected onSocketError(socket: net.Socket, error)
  {
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
    this.myDescriptorManager.socketError(socket[DESCRIPTOR_ID]);
  }

  protected onSocketClose(socket: net.Socket)
  {

    // Here we are accessing our custom property that we dynamically
    // added to our socket (that's the reason for [] brackets).
    ASSERT_FATAL(socket[DESCRIPTOR_ID] !== undefined,
      "Missing property '" + DESCRIPTOR_ID + "' on socket");
    this.myDescriptorManager.socketClose(socket[DESCRIPTOR_ID]);
  }

  // ---------- Auxiliary protected methods -------------

  protected checkEventHandlerAbsence(socket: net.Socket, event: string)
  {
    let registeredEvents =
      events.EventEmitter.listenerCount(socket, event);
    ASSERT_FATAL(registeredEvents === 0,
      "Event " + event + " is already registered on socket");
  }

  // Sets socket transfer mode, registers event handlers, etc.
  protected initTelnetSocket(socket: net.Socket)
  {
    let gameServer = GameServer.getInstance();

    // Tell the socket to interpret data as raw binary stream.
    socket.setEncoding('binary');

    // Check that event handler for 'data' event is not already registered.
    this.checkEventHandlerAbsence(
      socket, TelnetServer.events.SOCKET_RECEIVED_DATA);

    // Register event handler for 'data' event.
    socket.on
    (
      TelnetServer.events.SOCKET_RECEIVED_DATA,
      (data) => { this.onSocketReceivedData(socket, data); }
    );

    // Check that event handler for 'error' event is not already registered.
    this.checkEventHandlerAbsence(
      socket, TelnetServer.events.SOCKET_ERROR);

    // Register event handler for 'error' event.
    socket.on
    (
      TelnetServer.events.SOCKET_ERROR,
      (error) => { this.onSocketError(socket, error); }
    );

    // Check that event handler for 'close' event is not already registered.
    this.checkEventHandlerAbsence(
      socket, TelnetServer.events.SOCKET_CLOSE);

    // Register event handler for 'close' event.
    socket.on
    (
      TelnetServer.events.SOCKET_CLOSE,
      () => { this.onSocketClose(socket); }
    );
  }
}
