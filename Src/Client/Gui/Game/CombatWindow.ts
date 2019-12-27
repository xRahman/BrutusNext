/*
  Part of BrutusNEXT

  Combat window
*/

import { Component } from "../../../Client/Gui/Component";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class CombatWindow extends TitledWindow
{
  constructor(parent: Component)
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