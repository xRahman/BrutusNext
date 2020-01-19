/*
  Part of BrutusNEXT

  Group window
*/

import { Body } from "../../../Client/Gui/Html/Body";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/Window/TitledWindow";

export class GroupWindow extends TitledWindow
{
  constructor(protected parent: Body)
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