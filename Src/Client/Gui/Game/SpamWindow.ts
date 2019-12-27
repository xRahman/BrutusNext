/*
  Part of BrutusNEXT

  Spam window
*/

import { Windows } from "../../../Client/Gui/Windows";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class SpamWindow extends TitledWindow
{
  constructor(parent: HTMLElement)
  {
    super(parent, "spam_window", "Spam Window");

    this.visibility.set(Windows.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}