/*
  Part of BrutusNEXT

  Chat window
*/

import { Body } from "../../../Client/Gui/Body";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class ChatWindow extends TitledWindow
{
  constructor(parent: Body)
  {
    super(parent, "chat_window", "Chat Window");

    this.visibility.set(Gui.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}