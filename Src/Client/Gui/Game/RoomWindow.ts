/*
  Part of BrutusNEXT

  Room window
*/

import { Body } from "../../../Client/Gui/Body";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class RoomWindow extends TitledWindow
{
  constructor(parent: Body)
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