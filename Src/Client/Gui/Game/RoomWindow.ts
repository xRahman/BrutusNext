/*
  Part of BrutusNEXT

  Room window
*/

import { Body } from "../../../Client/Gui/Html/Body";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/Window/TitledWindow";

export class RoomWindow extends TitledWindow
{
  constructor(protected parent: Body)
  {
    super(parent, "room_window", "Room Window");

    this.visibility.set(Gui.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}