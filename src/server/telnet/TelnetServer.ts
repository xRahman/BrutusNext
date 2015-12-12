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
import {Id} from '../../shared/Id';
import {Server} from '../../server/Server';
import {DescriptorManager} from '../../server/DescriptorManager';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js
import * as events from 'events';  // Import namespace 'events' from node.js

// This constant is used to extend socket objects with new property.
const DESCRIPTOR_ID = 'descriptorId';

const ANSI =
{
  '&n': '\u001b[0m',
  '&d': '\u001b[1m',      // bold
  '&i': '\u001b[3m',      // italic
  '&u': '\u001b[4m',      // underline
  '&l': '\u001b[5m',      // blink
  '&k': '\u001b[30m',     // black
  '&Ki': '\u001b[1;3;30m', // black, bold, italic
  '&K': '\u001b[1;30m',
  '&r': '\u001b[31m',
  '&Ri': '\u001b[1;3;31m', // red, bold, italic
  '&R': '\u001b[1;31m',
  '&g': '\u001b[32m',
  '&Gi': '\u001b[1;3;32m', // green, bold, italic
  '&G': '\u001b[1;32m',
  '&y': '\u001b[33m',
  '&Y': '\u001b[1;33m',
  '&b': '\u001b[34m',
  '&Bi': '\u001b[1;3;34m', // blue, bold, italic
  '&B': '\u001b[1;34m',
  '&m': '\u001b[35m',
  '&M': '\u001b[1;35m',
  '&c': '\u001b[36m',
  '&C': '\u001b[1;36m',
  '&w': '\u001b[37m',
  '&W': '\u001b[1;37m'
};

/*
/// Zatim nepouzito.
const ANSI256 = ['#000', '#B00', '#0B0', '#BB0', '#00B', '#B0B', '#0BB',
                '#BBB', '#555', '#F55', '#5F5', '#FF5', '#55F', '#F5F',
                '#5FF', '#FFF', '#000', '#005', '#008', '#00B', '#00D',
                '#00F', '#050', '#055', '#058', '#05B', '#05D', '#05F',
                '#080', '#085', '#088', '#08B', '#08D', '#08F', '#0B0',
                '#0B5', '#0B8', '#0BB', '#0BD', '#0BF', '#0D0', '#0D5',
                '#0D8', '#0DB', '#0DD', '#0DF', '#0F0', '#0F5', '#0F8',
                '#0FB', '#0FD', '#0FF', '#500', '#505', '#508', '#50B',
                '#50D', '#50F', '#550', '#555', '#558', '#55B', '#55D',
                '#55F', '#580', '#585', '#588', '#58B', '#58D', '#58F',
                '#5B0', '#5B5', '#5B8', '#5BB', '#5BD', '#5BF', '#5D0',
                '#5D5', '#5D8', '#5DB', '#5DD', '#5DF', '#5F0', '#5F5',
                '#5F8', '#5FB', '#5FD', '#5FF', '#800', '#805', '#808',
                '#80B', '#80D', '#80F', '#850', '#855', '#858', '#85B',
                '#85D', '#85F', '#880', '#885', '#888', '#88B', '#88D',
                '#88F', '#8B0', '#8B5', '#8B8', '#8BB', '#8BD', '#8BF',
                '#8D0', '#8D5', '#8D8', '#8DB', '#8DD', '#8DF', '#8F0',
                '#8F5', '#8F8', '#8FB', '#8FD', '#8FF', '#B00', '#B05',
                '#B08', '#B0B', '#B0D', '#B0F', '#B50', '#B55', '#B58',
                '#B5B', '#B5D', '#B5F', '#B80', '#B85', '#B88', '#B8B',
                '#B8D', '#B8F', '#BB0', '#BB5', '#BB8', '#BBB', '#BBD',
                '#BBF', '#BD0', '#BD5', '#BD8', '#BDB', '#BDD', '#BDF',
                '#BF0', '#BF5', '#BF8', '#BFB', '#BFD', '#BFF', '#D00',
                '#D05', '#D08', '#D0B', '#D0D', '#D0F', '#D50', '#D55',
                '#D58', '#D5B', '#D5D', '#D5F', '#D80', '#D85', '#D88',
                '#D8B', '#D8D', '#D8F', '#DB0', '#DB5', '#DB8', '#DBB',
                '#DBD', '#DBF', '#DD0', '#DD5', '#DD8', '#DDB', '#DDD',
                '#DDF', '#DF0', '#DF5', '#DF8', '#DFB', '#DFD', '#DFF',
                '#F00', '#F05', '#F08', '#F0B', '#F0D', '#F0F', '#F50',
                '#F55', '#F58', '#F5B', '#F5D', '#F5F', '#F80', '#F85',
                '#F88', '#F8B', '#F8D', '#F8F', '#FB0', '#FB5', '#FB8',
                '#FBB', '#FBD', '#FBF', '#FD0', '#FD5', '#FD8', '#FDB',
                '#FDD', '#FDF', '#FF0', '#FF5', '#FF8', '#FFB', '#FFD',
                '#FFF', 'rgb(8,8,8)', 'rgb(18,18,18)', 'rgb(28,28,28)',
                'rgb(38,38,38)', 'rgb(48,48,48)', 'rgb(58,58,58)',
                'rgb(68,68,68)', 'rgb(78,78,78)', 'rgb(88,88,88)',
                'rgb(98,98,98)', 'rgb(108,108,108)', 'rgb(118,118,118)',
                'rgb(128,128,128)', 'rgb(138,138,138)', 'rgb(148,148,148)',
                'rgb(158,158,158)', 'rgb(168,168,168)', 'rgb(178,178,178)',
                'rgb(188,188,188)', 'rgb(198,198,198)', 'rgb(208,208,208)',
                'rgb(218,218,218)', 'rgb(228,228,228)', 'rgb(238,238,238)'];
*/

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
    let socketDescriptorId: Id =
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
    /// DEBUG
    /// console.log("onSocketReceivedData(): " + data);

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
    // Tell the socket to interpret data as raw binary stream.
    // (it's necessary for unicode characters to transmit correctly)
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

  // Converts MUD color codes (e.g. "&gSomething &wcolorful&g) to ANSI color
  // codes.
  public static ansify(data: string): string
  {
    if (/(&[a-zA-Z])/.test(data))
    {
      /// DEBUG
      /// console.log("Ansify started");

      for (let code in ANSI)
      {
        let regExp = new RegExp(code, 'g');
        data = data.replace(regExp, ANSI[code]);
      }
    }

    /// DEBUG
    /// console.log("Data after ansify: " + data);

    /*
    /// We don't use codes like '&0' right now 
    /// (whatever this is supposed to do)
    if (/&([0-9]+)/.test(data))
      data = data.replace(/&([0-9]+)/ig, '\u001b[38;5;$1m');
    */

    return data;
  }
}
