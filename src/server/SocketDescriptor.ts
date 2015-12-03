/*
  Part of BrutusNEXT

  Implements container for information associated to a socket.
*/

import * as net from 'net';  // Import namespace 'net' from node.js

export class SocketDescriptor
{
  public get socket() { return this.mySocket; }

  constructor
  (
    protected mySocket: net.Socket,
    protected myId
  )
  { }
}