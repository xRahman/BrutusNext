/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Specifies format of data packet.
*/

/*
  Example of Packet (when serialized to JSON):

  // Packet
  {
    parts =
    [
      // PacketPart
      {
        type: 'MUD_MESSAGE'
        data:
        // PacketData
        {
          message: 'Zuzka leaves north.'
        }
      }
    ]
  }
*/

'use strict';

///import {PacketPart} from '../../shared/protocol/PacketPart';
///import {PacketData} from '../../shared/protocol/PacketData';

interface PacketPart
{
  type: Packet.DataType,
  data: any
}

export class Packet
{

  // -------------- Static class data -------------------

  //------------------ Public data ----------------------  

  public parts = new Array<PacketPart>();

  //----------------- Protected data --------------------

  // ----------------- Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public toJson()
  {
    return JSON.stringify(this);
  }

  public add(type: Packet.DataType, data: any)
  {
    let part: PacketPart =
    {
      type: type,
      data: data
    };

    this.parts.push(part);
  }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module Packet
{
  export enum DataType
  {
    // Command send by player to the server.
    COMMAND,
    // Colored text sent by server that should be output to scrolview window.
    MUD_MESSAGE,
    // Data to be processed by editor.
    EDITOR_INPUT,
    // Data sent back to the server by the editor.
    EDITOR_OUTPUT,
    EDITOR_CREATE_ROOM
  }
}
