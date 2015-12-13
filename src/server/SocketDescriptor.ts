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
  constructor(protected mySocket: net.Socket) {}

  // ----------------- Public data ----------------------

  public set playerConnectionId(value: Id)
  {
    ASSERT(value !== undefined && value !== null,
      "Invalid player connection id");
    this.myPlayerConnectionId = value;
  }
  
  // Accessors can't be declared as abstract for some reason so we will
  // make it abstract the hard way.
  public get remoteAddress(): string
  {
    throw new Error("Abstract method call");
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

  // -------------- Protected methods -------------------

}