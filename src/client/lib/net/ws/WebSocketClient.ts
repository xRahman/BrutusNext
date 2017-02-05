/*
  Part of BrutusNEXT

  Implements web socket client.
*/

'use strict';

import {ERROR} from '../../error/ERROR';
import {WebSocketDescriptor} from './WebSocketDescriptor';

export class WebSocketClient
{
  // -------------- Static class data -------------------

  //------------------ Public data ---------------------- 
  
  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // Checks if browser supports web sockets.
  public static webSocketsAvailable()
  {
    if (WebSocket === undefined)
    {
      // Use 'MozWebSocket' if it's available.
      if ('MozWebSocket' in window)
      {
        WebSocket = window['MozWebSocket'];
        return true;
      }

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