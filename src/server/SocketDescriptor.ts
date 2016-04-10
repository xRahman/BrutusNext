/*
  Part of BrutusNEXT

  Abstract ancestor for descriptors encapsulating specific types of sockecs
  (like telnet socket).

*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Server} from '../server/Server';
import {Id} from '../shared/Id';
import {PlayerConnection} from '../server/PlayerConnection';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js

export abstract class SocketDescriptor
{
  constructor(protected socket: net.Socket)
  {
    ASSERT(this.socket.address !== undefined,
      "Missing address on socket");

    // Remember ip address because we need to know it even after ours socket
    // closes.
    this.ipAddress = this.socket.remoteAddress;
  }

  // ----------------- Public data ----------------------

  public getPlayerConnectionId() { return this.playerConnectionId; }
  public setPlayerConnectionId(value: Id)
  {
    ASSERT(value !== undefined && value !== null,
      "Invalid player connection id");
    this.playerConnectionId = value;
  }

  public getIpAddress(): string
  {
    ASSERT(this.ipAddress != null,
      "Ip address is not initialized on socket descriptor");

    return this.ipAddress;
  }
 
  public get playerConnection()
  {
    ASSERT_FATAL(this.playerConnectionId !== null,
      "Invalid player connection id");

    return Server.playerConnectionManager
      .getPlayerConnection(this.playerConnectionId);
  }

  public playerConnectionId: Id = null;

  public socketClosed = false;

  // ---------------- Public methods --------------------
 
  public abstract initSocket();

  // Sends a string to the user.
  public abstract send(data: string);

  // Closes the socket, ending the connection.
  public closeSocket()
  {
    this.socketClosed = true;
  }

  // -------------- Protected class data ----------------

  protected ipAddress: string = "";

  // -------------- Protected methods -------------------

}