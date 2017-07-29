/*
  Part of BrutusNEXT

  Player's avatar in the world.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
// import {WebSocketDescriptor} from
//   '../../../client/lib/net/ws/WebSocketDescriptor';
import {ScrollWindow} from '../../../client/gui/scroll/ScrollWindow';
///import {MapWindow} from '../../../client/gui/component/MapWindow';

/// TEST:
///import {Packet} from '../../../shared/lib/protocol/Packet';

export class Avatar
{
  constructor(scrollWindow: ScrollWindow)
  {
    this.scrollWindow = scrollWindow;
  }

  // -------------- Static class data -------------------

  // ----------------- Public data ----------------------

  public scrollWindow: ScrollWindow = null;

  /// MapWindow bude jen jedno pro celou ClientApp.
  ///public mapWindow: MapWindow = null;

  // ----------------- Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  public receiveMessage(message: string)
  {
    this.scrollWindow.receiveMessage(message);
  }

  // Outputs a client system message.
  public clientMessage(message: string)
  {
    this.scrollWindow.clientMessage(message);
  }

  // ---------------- Event handlers --------------------

  // ---------------- Private methods -------------------

}