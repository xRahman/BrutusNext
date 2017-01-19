/*
  Part of BrutusNEXT

  Implements user connection to the server.
*/

'use strict';

import ERROR = require('../error/ERROR');
import WebSocketDescriptor = require('../net/ws/WebSocketDescriptor');


class Connection
{
  constructor (private socketDescriptor: WebSocketDescriptor) { }

  // -------------- Static class data -------------------

  //------------------ Public data ---------------------- 
  
  /*
  /// TODO: Socket descriptoru muze byt vic (imm muze chtit lognout
  /// vic charu). Tezko rict, kde by mely byt - primo ve scrollView
  /// asi ne, protoze connection ovlivnuje vic elementu nez jen
  /// scrollview.
  /// (scrollview by si kazdopadne melo drzet descriptor, do ktereho
  ///  zapisuje)
  public webSocketDescriptor = new WebSocketDescriptor();
  */

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  // Sends 'data' to the connection.
  public send(data: string)
  {
    /// TODO
  }

  // ---------------- Event handlers --------------------

  // ---------------- Private methods -------------------

}

export = Connection;