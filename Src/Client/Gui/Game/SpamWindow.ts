/*
  Part of BrutusNEXT

  Spam window
*/

import { Component } from "../../../Client/Gui/Component";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class SpamWindow extends TitledWindow
{
  constructor(parent: Component)
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