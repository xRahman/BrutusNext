/*
  Part of BrutusNEXT

  Implements web socket client.
*/

'use strict';

import ERROR = require('../../error/ERROR');
import WebSocketDescriptor = require('./WebSocketDescriptor');

class WebSocketClient
{
  // -------------- Static class data -------------------

  //------------------ Public data ---------------------- 
  
  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // Checks if browser supports web sockets.
  public static webSocketsAvailable()
  {
    /// Note: MozWebSocket might still be available.
    /// (this code won't compile in typescript though):
    /// WebSocket = WebSocket || MozWebSocket;

    if (WebSocket === undefined)
    {
      alert("Sorry, you browser doesn't support websockets.");
      return false;
    }

    return true;
  }

  // ---------------- Public methods --------------------

  public createSocketDescriptor()
  {
    return new WebSocketDescriptor();
  }

  // ---------------- Event handlers --------------------

  // ---------------- Private methods -------------------

}

export = WebSocketClient;