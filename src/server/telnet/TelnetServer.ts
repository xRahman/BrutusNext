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

import {Mudlog} from '../../server/Mudlog';
import {GameServer} from '../../server/GameServer';
import {ASSERT_FATAL} from '../../shared/ASSERT';

// Built-in node.js modules
import * as net from 'net';  // Import namespace 'net' from node.js
import * as events from 'events';  // Import namespace 'events' from node.js

export class TelnetServer
{
  static get EVENT_CONNECTION_REQUEST() { return 'connection_request'; }
  static get EVENT_SERVER_STARTED_LISTENING() { return 'listening'; }
  static get EVENT_SOCKET_RECEIVED_DATA() { return 'data'; }
  static get EVENT_SOCKET_ERROR() { return 'error'; }
  static get EVENT_SOCKET_CLOSE() { return 'close'; }

  public open = false; // Do we accept new connections?

  public start()
  {
    this.myTelnetServer = net.createServer(TelnetServer.onNewConnection);

    // Register handler to open the server to the new connection when
    // telnet server is ready (e. g. when 'listening' event is emited).
    this.myTelnetServer.on(
      TelnetServer.EVENT_SERVER_STARTED_LISTENING,
      TelnetServer.onServerStartsListening);

    Mudlog.log(
      "Starting telnet server at port " + this.port,
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL);

    this.myTelnetServer.listen(this.port);
  }

  constructor
  (
    public port: number,
    protected myGameServer: GameServer
  )
  {
    this.myCommProcessor.on
    (
      TelnetServer.EVENT_CONNECTION_REQUEST,
      function(socketId) { TelnetServer.onNewConnectionRequest(socketId) }
    );
  }

  protected myTelnetServer: net.Server;
  protected myCommProcessor = new events.EventEmitter();

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

  protected static onNewConnection(socket: net.Socket)
  {
    let gameServer = GameServer.getInstance();
    let telnetServer = gameServer.telnetServer;

    socket.write('Welcome to the Telnet server!');

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

      // Half - closes the socket.i.e., it sends a FIN packet.
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


    // Taky netusim, k cemu to je dobre.
    socket.setEncoding('binary');

    let socketId = gameServer.socketManager.addSocket(socket);

    telnetServer.myCommProcessor.emit(TelnetServer.EVENT_CONNECTION_REQUEST,
      socketId);

    /// TODO:
    /// Co se socket idCkem?
    /// - predhodit ho Logovacimu procesu, ktery zjisti, ktery player ze se
    ///   to snazi zalogovat
    /// - logovaciProces ho nasledne preda prislusnemu playerovi
    /// Ten proces by mel asi obsluhovat server. Bude na to potrebovat socket
    /// deskriptor, ktery vzniknul pridanim socketu do SocketManageru
  }

  protected static onNewConnectionRequest(socketId: string)
  {
    let gameServer = GameServer.getInstance();

    let socket = gameServer.socketManager.getSocketById(socketId);

    /// TODO: Nejaky check, ze socket jeste neni zinicializovany, abych
    /// nevyrabel duplicitni event listenery

    socket.on
    (
      TelnetServer.EVENT_SOCKET_RECEIVED_DATA,
      function(data) { TelnetServer.onSocketReceivedData(socket, data); }
    );

    socket.on
    (
      TelnetServer.EVENT_SOCKET_ERROR,
      function(error) { TelnetServer.onSocketError(socket, error); }
    );

    socket.on
    (
      TelnetServer.EVENT_SOCKET_CLOSE,
      function() { TelnetServer.onSocketClose(socket); }
    );
  }

  protected static onSocketReceivedData(socket: net.Socket, data /* TODO: Jaky to muze mit typ? */)
  {
  }

  protected static onSocketError(socket: net.Socket, error /* TODO: Jaky to muze mit typ? */)
  {
  }

  protected static onSocketClose(socket: net.Socket)
  {
  }
}

// ---------------------- private module stuff -------------------------------

/*
  Mudlog.log(
    "User connected...",
    Mudlog.msgType.SYSTEM_INFO,
    Mudlog.levels.IMMORTAL);

    ASSERT_FATAL(false,
      "Cannot start telnet server on port "
      + port + ", address is already in use.\n"
      + "Do you have a MUD server already running?");

    ASSERT_FATAL(false,
      "Cannot start telnet server on port "
      + port + ", permission denied.\n"
      + "Are you trying to start it on a priviledged port without"
      + " being root?");
*/