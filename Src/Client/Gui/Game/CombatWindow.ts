/*
  Part of BrutusNEXT

  Combat window
*/

import { Windows } from "../../../Client/Gui/Windows";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class CombatWindow extends TitledWindow
{
  constructor(parent: HTMLElement)
  {
    super(parent, "combatt_window", "Combat Window");

    this.visibility.set(Windows.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}