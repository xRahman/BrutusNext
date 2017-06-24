/*
  Part of BrutusNEXT

  Abstract ancestor for descriptors encapsulating specific types of sockets
  (like telnet socket).
*/

// 'use strict';

// import {ERROR} from '../../../shared/lib/error/ERROR';
// import {ServerApp} from '../../../server/lib/app/ServerApp';
// import {Connection} from '../../../server/lib/net/Connection';
// import {Packet} from '../../../shared/lib/protocol/Packet';

// // Built-in node.js modules.
// import * as net from 'net';  // Import namespace 'net' from node.js

// export abstract class ServerSocket
// {
//   constructor(ip: string)
//   {
//     // Remember ip address because we need to know it
//     // even after ours socket closes.
//     this.ip = ip;
//   }

//   // -------------- Static class data -------------------

//   // ----------------- Public data ----------------------

//   /*
//   public getConnectionId() { return this.connectionId; }
//   public setConnectionId(value: EntityId)
//   {
//     ASSERT(value !== undefined && value !== null,
//       "Invalid player connection id");
//     this.connectionId = value;
//   }
//   */

//   public getIpAddress(): string
//   {
//     if (this.ip === null)
//       ERROR("Ip address is not initialized on socket descriptor");

//     return this.ip;
//   }

//   /*
//   public get connection()
//   {
//     ASSERT_FATAL(this.connectionId !== null,
//       "Invalid player connection id");

//     return this.connectionId.getEntity({ typeCast: Connection });
//   }
//   */

//   ///public connectionId: EntityId = null;
//   public connection: Connection = null;

//   public closed = false;

//   // ---------------- Public methods --------------------
 
//   // Closes the socket, ending the connection.
//   public abstract close();

//   // Sends packet to the client.
//   public abstract send(packet: Packet);

//   //----------------- Protected data --------------------

//   protected ip: string = null;

//   // Command lines waiting to be processed.
//   protected commandsBuffer = [];

//   // -------------- Protected methods -------------------

//   /// Tohle by asi taky nemělo bejt tady...
//   /// (Kdo by měl processit commandy? Commands?)
//   /// - navíc se to nejspíš bude týkat jen packetů typu Command.
//   /// Na druhou stranu commandsBuffer[] by asi měl být per connection.
//   /// (Takže by to asi přece jen měla dělat Connection.)
//   protected async processInput(input: string)
//   {
//     // Split input by newlines.
//     let lines = input.split(ServerSocket.NEW_LINE);

//     // And push each line as a separate command to commandsBuffer[] to be
//     // processed (.push.apply() appends an array to another array).
//     this.commandsBuffer.push.apply(this.commandsBuffer, lines);

//     // Handle each line as a separate command.
//     for (let command of this.commandsBuffer)
//     {
//       // Trim the command (remove leading and trailing white
//       // spaces, including newlines) before processing.
//       await this.connection.processCommand(command.trim());
//     }

//     // All commands are processed, mark the buffer as empty.
//     // (if will also hopefully flag allocated data for freeing from memory)
//     this.commandsBuffer = [];
//   }
// }