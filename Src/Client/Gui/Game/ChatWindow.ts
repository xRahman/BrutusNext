/*
  Part of BrutusNEXT

  Chat window
*/

import { Component } from "../../../Client/Gui/Component";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class ChatWindow extends TitledWindow
{
  constructor(parent: Component)
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