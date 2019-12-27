/*
  Part of BrutusNEXT

  Room window
*/

import { Windows } from "../../../Client/Gui/Windows";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class RoomWindow extends TitledWindow
{
  constructor(parent: HTMLElement)
  {
    super(parent, "room_window", "Room Window");

    this.visibility.set(Windows.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}