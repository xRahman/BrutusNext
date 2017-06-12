/*
  Part of BrutusNEXT

  Implements user connection to the server.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {WebSocketDescriptor} from
  '../../../client/lib/net/ws/WebSocketDescriptor';
import {ScrollWindow} from '../../../client/gui/component/ScrollWindow';
import {MapWindow} from '../../../client/gui/component/MapWindow';

/// TEST:
import {Packet} from '../../../shared/lib/protocol/Packet';

export class Connection
{
  private socketDescriptor: WebSocketDescriptor = null;
  /*
  constructor (private socketDescriptor: WebSocketDescriptor)
  {
    socketDescriptor.connection = this;
  }
  */

  // -------------- Static class data -------------------

  //------------------ Public data ----------------------

  public scrollWindow: ScrollWindow = null;
  public mapWindow: MapWindow = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  // Attempts to open the websocket connection.
  public connect()
  {
    this.socketDescriptor = new WebSocketDescriptor();

    this.clientMessage('Opening websocket connection...');

    this.socketDescriptor.connect();
  }

  // Sends 'data' to the connection.
  public sendCommand(data: string)
  {
    /// TODO: Vytvoření packetu
    let packet = new Packet();
    packet.add(Packet.DataType.COMMAND, data);

    // If the connection is closed, any user command
    // (even an empty one) triggers reconnect attempt.
    if (!this.socketDescriptor.isSocketOpen())
      this.socketDescriptor.reConnect();
    else
      this.socketDescriptor.send(data);
  }

  // Sends 'data' to the connection.
  public send(packet: Packet)
  {
    // If the connection is closed, any user command
    // (even an empty one) triggers reconnect attempt.
    if (!this.socketDescriptor.isSocketOpen())
      this.socketDescriptor.reConnect();
    else
      this.socketDescriptor.send(packet.toJson());
  }

  // Receives 'message' from the connection
  // (appends it to the output of respective scrollwindow).
  public receiveMudMessage(message: string)
  {
    this.scrollWindow.receiveData(message);
  }

  // Outputs a client system message.
  public clientMessage(message: string)
  {
    this.scrollWindow.clientMessage(message);
  }

  // ---------------- Event handlers --------------------

  // ---------------- Private methods -------------------

}