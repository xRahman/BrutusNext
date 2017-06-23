/*
  Part of BrutusNEXT

  Connection to the server.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {ClientWebSocket} from '../../../client/lib/net/ws/ClientWebSocket';
import {ScrollWindow} from '../../../client/gui/scroll/ScrollWindow';
import {Avatar} from '../../../client/lib/connection/Avatar';

/// TEST:
import {Packet} from '../../../shared/lib/protocol/Packet';

export class Connection
{
  private socket: ClientWebSocket = null;

  // -------------- Static class data -------------------

  //------------------ Public data ----------------------

  public activeAvatar: Avatar = null;

  //------------------ Private data ---------------------

  private avatars = new Set<Avatar>();

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  public createAvatar(scrollWindow: ScrollWindow)
  {
    let avatar = new Avatar(scrollWindow);

    this.avatars.add(avatar);

    return avatar;
  }

  // Attempts to open the websocket connection.
  public connect()
  {
    this.socket = new ClientWebSocket(this);
    this.clientMessage('Opening websocket connection...');
    this.socket.connect();
  }

  // Sends 'data' to the connection.
  public sendCommand(command: string)
  {
    let packet = new Packet();

    packet.addCommand(command);

    // If the connection is closed, any user command
    // (even an empty one) triggers reconnect attempt.
    if (!this.socket.isOpen())
      this.socket.reConnect();
    else
      this.socket.send(packet.serialize(Serializable.Mode.SEND_TO_SERVER));
  }

  // Sends 'data' to the connection.
  public send(packet: Packet)
  {
    // If the connection is closed, any user command
    // (even an empty one) triggers reconnect attempt.
    if (!this.socket.isOpen())
    {
      ERROR("Attempt to send packet to the closed connection");
      return;
    }

    this.socket.send(packet.serialize(Serializable.Mode.SEND_TO_SERVER));
  }

  // Receives 'message' from the connection
  // (appends it to the output of respective scrollwindow).
  public receiveMudMessage(message: string)
  {
    if (this.activeAvatar)
      this.activeAvatar.receiveMessage(message);
  }

  // Outputs a client system message.
  public clientMessage(message: string)
  {
    if (this.activeAvatar)
      this.activeAvatar.clientMessage(message);
  }

  // ---------------- Event handlers --------------------

  // ---------------- Private methods -------------------

}