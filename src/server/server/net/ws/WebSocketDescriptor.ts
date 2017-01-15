/*
  Part of BrutusNEXT

  Encapsulates a websocket.
*/

'use strict';

// import {ERROR} from '../../../shared/error/ERROR';
// import {Utils} from '../../../shared/Utils';
// import {Syslog} from '../../../server/Syslog';
// import {Message} from '../../../server/message/Message';
// import {Account} from '../../../server/account/Account';
// import {AdminLevel} from '../../../server/AdminLevel';
// import {Server} from '../../../server/Server';
// import {SocketDescriptor} from '../../../server/net/SocketDescriptor';
// import {Connection} from '../../../server/connection/Connection';

// Built-in node.js modules.
// import * as net from 'net';  // Import namespace 'net' from node.js
// import * as events from 'events';  // Import namespace 'events' from node.js

export class WebSocketDescriptor
{
  constructor(socket: WebSocket)
  {
    //this.initSocket();
  }

  // -------------- Static class data -------------------

  /*
  // Newlines are normalized to this sequence both before
  // sending (in Message.compose()) and after receiving
  // (in TelnetSocketDescriptor.onSocketReceivedData()).
  static get NEW_LINE() { return '\r\n'; }
  */

  //------------------ Private data ---------------------

  /*
  private static events =
  {
    SOCKET_RECEIVED_DATA: 'data',
    SOCKET_ERROR: 'error',
    SOCKET_CLOSE: 'close'
  }
  */

  // ---------------- Public methods --------------------

  // ---------------- Event handlers --------------------

  // -------------- Protected methods -------------------

}