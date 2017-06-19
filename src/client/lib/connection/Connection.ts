/*
  Part of BrutusNEXT

  Connection to the server.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
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
  public sendCommand(data: string)
  {
    /// TODO: Vytvoření packetu
    let packet = new Packet();
    packet.add(Packet.DataType.COMMAND, data);

    // If the connection is closed, any user command
    // (even an empty one) triggers reconnect attempt.
    if (!this.socket.isOpen())
      this.socket.reConnect();
    else
      this.socket.send(data);
  }

  // Sends 'data' to the connection.
  public send(packet: Packet)
  {
    // If the connection is closed, any user command
    // (even an empty one) triggers reconnect attempt.
    if (!this.socket.isOpen())
      this.socket.reConnect();
    else
      this.socket.send(packet.toJson());
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