/*
  Part of BrutusNEXT

  Player's avatar in the world.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Character} from '../../../client/game/character/Character';
import {Windows} from '../../../client/gui/window/Windows';
import {ScrollWindow} from '../../../client/gui/scroll/ScrollWindow';

export class Avatar
{
  constructor
  (
    public character: Character
  )
  {
    this.scrollWindow = Windows.createScrollWindow();

    this.setScrollWindowTitle();
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

  private setScrollWindowTitle()
  {
    let title = this.character.getName() + "@BrutusNext";

    this.scrollWindow.setTitle(title);
  }

}