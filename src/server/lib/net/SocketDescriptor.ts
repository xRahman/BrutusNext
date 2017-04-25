/*
  Part of BrutusNEXT

  Abstract ancestor for descriptors encapsulating specific types of sockets
  (like telnet socket).
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {ServerApp} from '../../../server/lib/ServerApp';
import {Connection} from '../../../server/lib/connection/Connection';

// Built-in node.js modules.
import * as net from 'net';  // Import namespace 'net' from node.js

export abstract class SocketDescriptor
{
  constructor(ip: string)
  {
    // Remember ip address because we need to know it
    // even after ours socket closes.
    this.ip = ip;
  }

  // -------------- Static class data -------------------

  // Newlines are normalized to this sequence both before
  // sending (in Message.compose()) and after receiving
  // (in TelnetSocketDescriptor.onSocketReceivedData()).
  public static get NEW_LINE() { return '\r\n'; }

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
    if (this.ip === null)
      ERROR("Ip address is not initialized on socket descriptor");

    return this.ip;
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
 
  ///public abstract initSocket();

  // Sends a string to the user.
  public abstract sendMudMessage(data: string);

  // Closes the socket, ending the connection.
  public abstract closeSocket();

  //----------------- Protected data --------------------

  protected ip: string = null;

  // Command lines waiting to be processed.
  protected commandsBuffer = [];

  // -------------- Protected methods -------------------

  protected async processInput(input: string)
  {
    // Split input by newlines.
    let lines = input.split(SocketDescriptor.NEW_LINE);

    // And push each line as a separate command to commandsBuffer[] to be
    // processed (.push.apply() appends an array to another array).
    this.commandsBuffer.push.apply(this.commandsBuffer, lines);

    // Handle each line as a separate command.
    for (let command of this.commandsBuffer)
    {
      // Trim the command (remove leading and trailing white
      // spaces, including newlines) before processing.
      await this.connection.processCommand(command.trim());
    }

    // All commands are processed, mark the buffer as empty.
    // (if will also hopefully flag allocated data for freeing from memory)
    this.commandsBuffer = [];
  }
}