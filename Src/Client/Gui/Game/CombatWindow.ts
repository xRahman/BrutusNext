/*
  Part of BrutusNEXT

  Combat window
*/

import { Body } from "../../../Client/Gui/Html/Body";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/Window/TitledWindow";

export class CombatWindow extends TitledWindow
{
  constructor(parent: Body)
  {
    super(parent, "combatt_window", "Combat Window");

    this.visibility.set(Gui.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}