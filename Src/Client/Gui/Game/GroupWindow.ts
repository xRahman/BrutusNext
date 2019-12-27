/*
  Part of BrutusNEXT

  Group window
*/

import { Windows } from "../../../Client/Gui/Windows";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class GroupWindow extends TitledWindow
{
  constructor(parent: HTMLElement)
  {
    super(parent, "group_window", "Group Window");

    this.visibility.set(Windows.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}