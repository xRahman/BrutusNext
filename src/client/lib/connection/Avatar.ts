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

  public scrollWindow: (ScrollWindow | null) = null;

  /// MapWindow bude jen jedno pro celou ClientApp.
  ///public mapWindow: (MapWindow | null) = null;

  // ----------------- Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // ---------------- Public methods --------------------

  public receiveMessage(message: string)
  {
    if (this.scrollWindow === null)
    {
      ERROR("Unexpected 'null' value");
      return;
    }

    this.scrollWindow.receiveMessage(message);
  }

  // Outputs a client system message.
  public clientMessage(message: string)
  {
    if (this.scrollWindow === null)
    {
      ERROR("Unexpected 'null' value");
      return;
    }

    this.scrollWindow.clientMessage(message);
  }

  // ---------------- Event handlers --------------------

  // ---------------- Private methods -------------------

  private setScrollWindowTitle()
  {
    let title = this.character.getName() + "@BrutusNext";

    if (this.scrollWindow === null)
    {
      ERROR("Unexpected 'null' value");
      return;
    }

    this.scrollWindow.setTitle(title);
  }

}