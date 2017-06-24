/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Specifies format of one part of data packet.
*/

'use strict';

import {Serializable} from '../../../shared/lib/class/Serializable';

export class PacketPart extends Serializable
{
  constructor
  (
    public type: PacketPart.Type,
    public data: string
  )
  {
    super();

    this.version = 0;
  }
}

// ------------------ Type declarations ----------------------

export module PacketPart
{
  export enum Type
  {
    // Command send by player to the server.
    COMMAND,
    // Colored text sent by server that should be output to scrolview window.
    MUD_MESSAGE,
    // Player asks for authorization.
    LOGIN_REQUEST,
    // Server response to login request.
    LOGIN_RESPONSE,
    // Player wants to register a new account.
    REGISTER_REQUEST,
    // Server response to register request.
    REISTER_RESPONSE,
    // Data sent to the editor to be processed.
    EDITOR_INPUT,
    // Data sent by the editor back to the server.
    EDITOR_OUTPUT,
    MAP_CREATE_ROOM
  }
}
