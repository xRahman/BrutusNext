/*
  Part of BrutusNEXT

  Implements user connection to the server.
*/

'use strict';

import {ERROR} from '../error/ERROR';
import {WebSocketDescriptor} from '../net/ws/WebSocketDescriptor';
import {ScrollView} from '../component/ScrollView';
import {MapWindow} from '../component/MapWindow';

export class Connection
{
  constructor (private socketDescriptor: WebSocketDescriptor)
  {
    socketDescriptor.connection = this;
  }

  // -------------- Static class data -------------------

  //------------------ Public data ----------------------

  public scrollView: ScrollView = null;
  public mapWindow: MapWindow = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  // Attempts to open the websocket connection.
  public connect()
  {
    this.clientMessage('Opening websocket connection...');

    this.socketDescriptor.connect();
  }

  // Sends 'data' to the connection.
  public send(data: string)
  {
    // If the connection is closed, any user command
    // (even an empty one) triggers reconnect attempt.
    if (!this.socketDescriptor.isSocketOpen())
      this.socketDescriptor.reConnect();
    else
      this.socketDescriptor.send(data);
  }

  // Receives 'message' from the connection
  // (appends it to the output of respective scrollview window).
  public receiveMudMessage(message: string)
  {
    this.scrollView.receiveData(message);
  }

  // Outputs a client system message.
  public clientMessage(message: string)
  {
    this.scrollView.clientMessage(message);
  }

  // ---------------- Event handlers --------------------

  // ---------------- Private methods -------------------

}