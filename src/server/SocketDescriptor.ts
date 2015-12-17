/*
  Part of BrutusNEXT

  Abstract ancestor for descriptors encapsulating specific types of sockecs
  (like telnet socket).

*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {Server} from '../server/Server';
import {Id} from '../shared/Id';
import {PlayerConnection} from '../server/PlayerConnection';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js

export abstract class SocketDescriptor
{
  constructor(protected mySocket: net.Socket)
  {
    ASSERT(this.mySocket.address !== undefined,
      "Missing address on socket");

    // Remember ip address because we need to know it even after ours socket
    // closes.
    this.myIpAddress = this.mySocket.remoteAddress;
  }

  // ----------------- Public data ----------------------

  public set playerConnectionId(value: Id)
  {
    ASSERT(value !== undefined && value !== null,
      "Invalid player connection id");
    this.myPlayerConnectionId = value;
  }

  public get ipAddress()
  {
    ASSERT(this.myIpAddress != null,
      "Ip address is not initialized on socket descriptor");

    return this.myIpAddress;
  }
 
  public get playerConnection()
  {
    ASSERT(this.playerConnectionId !== null,
      "Invalid player connection id")

    return Server.playerConnectionManager
      .getPlayerConnection(this.myPlayerConnectionId);
  }

  // ---------------- Public methods --------------------
 
  public abstract initSocket();

  // Sends a string to the user.
  public abstract send(data: string);

  // Closes the socket, ending the connection.
  public abstract disconnect();

  // -------------- Protected class data ----------------

  protected myPlayerConnectionId: Id = null;

  protected myIpAddress: string = "";

  // -------------- Protected methods -------------------

}