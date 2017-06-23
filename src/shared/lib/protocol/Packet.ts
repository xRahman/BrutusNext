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
        type: 'MUD_MESSAGE',
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

import {Serializable} from '../../../shared/lib/class/Serializable';
import {TextMessage} from '../../../shared/lib/protocol/TextMessage';
///import {PacketPart} from '../../shared/protocol/PacketPart';
///import {PacketData} from '../../shared/protocol/PacketData';

/*
interface PacketPart
{
  type: Packet.DataType,
  data: any
}
*/

export class Packet extends Serializable
{

  // -------------- Static class data -------------------

  //------------------ Public data ----------------------  

  public parts = new Array<Packet.PartInterface>();
  ///public parts = new Array<PacketPart>();

  //----------------- Protected data --------------------

  // ----------------- Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  /// To be deprecated.
  // public toJson()
  // {
  //   return JSON.stringify(this);
  // }

  public addMudMessage(message: string)
  {
    let mudMessage = new TextMessage();

    mudMessage.message = message;

    this.add(Packet.PartType.MUD_MESSAGE, mudMessage);
  }

  public addCommand(message: string)
  {
    let mudMessage = new TextMessage();

    mudMessage.message = message;

    this.add(Packet.PartType.COMMAND, mudMessage);
  }

  /// To be deleted.
  // public add(type: Packet.DataType, data: any)
  // {
  //   let part: PacketPart =
  //   {
  //     type: type,
  //     data: data
  //   };

  //   this.parts.push(part);
  // }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private add(type: Packet.PartType, data: Serializable)
  {
    let part: Packet.PartInterface =
    {
      type: type,
      data: data
    }

    this.parts.push(part);
  }

}

// ------------------ Type declarations ----------------------

export module Packet
{
  export enum PartType
  {
    // Command send by player to the server.
    COMMAND,
    // Colored text sent by server that should be output to scrolview window.
    MUD_MESSAGE,
    // Data sent to the editor to be processed.
    EDITOR_INPUT,
    // Data sent by the editor back to the server.
    EDITOR_OUTPUT,
    MAP_CREATE_ROOM
  }

  export interface PartInterface
  {
    type: PartType,
    data: any
  }
}
