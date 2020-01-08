/*
  Part of BrutusNEXT

  Spam window
*/

import { Body } from "../../../Client/Gui/Body";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class SpamWindow extends TitledWindow
{
  constructor(parent: Body)
  {
    super(parent, "spam_window", "Spam Window");

    this.visibility.set(Gui.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}