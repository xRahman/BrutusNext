/*
  Part of BrutusNEXT

  Abstract ancestor for descriptors encapsulating specific types of sockecs
  (like telnet socket).

*/

'use strict';

import {ERROR} from '../shared/ERROR';
import {Server} from '../server/Server';
import {Connection} from '../server/Connection';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js

export abstract class SocketDescriptor
{
  constructor(protected socket: net.Socket)
  {
    if (this.socket.address === undefined)
    {
      ERROR("Missing address on socket");

      this.ipAddress = null;
    }

    // Remember ip address because we need to know it even after ours socket
    // closes.
    this.ipAddress = this.socket.remoteAddress;
  }

  // ----------------- Public data ----------------------

  /*
  public getConnectionId() { return this.connectionId; }
  public setConnectionId(value: EntityId)
  {
    ASSERT(value !== undefined && value !== null,
      "Invalid player connection id");
    this.connectionId = value;
  }
  */

  public getIpAddress(): string
  {
    if (this.ipAddress === null)
      ERROR("Ip address is not initialized on socket descriptor");

    return this.ipAddress;
  }

  /*
  public get connection()
  {
    ASSERT_FATAL(this.connectionId !== null,
      "Invalid player connection id");

    return this.connectionId.getEntity({ typeCast: Connection });
  }
  */

  ///public connectionId: EntityId = null;
  public connection: Connection = null;

  public socketClosed = false;

  // ---------------- Public methods --------------------
 
  public abstract initSocket();

  // Sends a string to the user.
  public abstract send(data: string);

  // Closes the socket, ending the connection.
  public abstract closeSocket();

  // -------------- Protected class data ----------------

  protected ipAddress: string = null;

  // -------------- Protected methods -------------------

}