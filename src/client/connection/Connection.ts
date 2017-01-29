/*
  Part of BrutusNEXT

  Implements user connection to the server.
*/

'use strict';

import ERROR = require('../error/ERROR');
import WebSocketDescriptor = require('../net/ws/WebSocketDescriptor');
import ScrollView = require('../component/ScrollView');

class Connection
{
  constructor (private socketDescriptor: WebSocketDescriptor)
  {
    socketDescriptor.connection = this;
  }

  // -------------- Static class data -------------------

  //------------------ Public data ----------------------

  public scrollView: ScrollView = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  public connect()
  {
    this.socketDescriptor.connect();
  }

  // Sends 'data' to the connection.
  public send(data: string)
  {
    this.socketDescriptor.send(data);
  }

  public receive(data: string)
  {
    this.scrollView.receiveData(data);
  }


  // ---------------- Event handlers --------------------

  // ---------------- Private methods -------------------

}

export = Connection;