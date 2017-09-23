/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Specifies format of data packet.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Connection} from '../../../shared/lib/connection/Connection';

export class Packet extends Serializable
{
  /*
  constructor()
  {
    super();

    this.version = 0;
  }
  */

  // -------------- Static class data -------------------

  // ----------------- Public data ----------------------

  ///public parts = new Array<PacketPart>();

  // ---------------- Protected data --------------------

  // ----------------- Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public process(connection: Connection)
  {
    // We can't use abstract class because it would prevent dynamic
    // typecasting to Packet (see Connection.receiveData()).
    ERROR("Method needs to be overriden in ancestor and it isn't");
  }

  // public addMudMessage(message: string)
  // {
  //   // Message is a string already so we don't have to serialize it.
  //   let part = new PacketPart(PacketPart.Type.MUD_MESSAGE, message);

  //   this.add(PacketPart.Type.MUD_MESSAGE, part);
  // }

  // public addCommand(message: string)
  // {
  //   // Command is a string already so we don't have to serialize it.
  //   let part = new PacketPart(PacketPart.Type.COMMAND, message);

  //   this.add(PacketPart.Type.MUD_MESSAGE, part);
  // }

  // public addLoginRequest(request: LoginRequest)
  // {
  //   let data = request.serialize(Serializable.Mode.SEND_TO_SERVER);
  //   let part = new PacketPart(PacketPart.Type.LOGIN_REQUEST, data);

  //   this.add(PacketPart.Type.MUD_MESSAGE, part);
  // }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  // private add(type: PacketPart.Type, part: PacketPart)
  // {
  //   this.parts.push(part);
  // }

}

// ------------------ Type declarations ----------------------

// export module Packet
// {
//   export enum Type
//   {
//     // Command send by player to the server.
//     COMMAND,
//     // Colored text sent by server that should be output to scrolview window.
//     MUD_MESSAGE,
//     // Data sent to the editor to be processed.
//     EDITOR_INPUT,
//     // Data sent by the editor back to the server.
//     EDITOR_OUTPUT,
//     MAP_CREATE_ROOM
//   }

//   export interface PartInterface
//   {
//     type: PartType,
//     data: string
//   }
// }
