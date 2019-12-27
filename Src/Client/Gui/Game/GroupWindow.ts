/*
  Part of BrutusNEXT

  Group window
*/

import { Component } from "../../../Client/Gui/Component";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class GroupWindow extends TitledWindow
{
  constructor(parent: Component)
  {
    super(parent, "group_window", "Group Window");

    this.visibility.set(Gui.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}