/*
  Part of BrutusNEXT

  Chat window
*/

import { Windows } from "../../../Client/Gui/Windows";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class ChatWindow extends TitledWindow
{
  constructor(parent: HTMLElement)
  {
    super(parent, "chat_window", "Chat Window");

    this.visibility.set(Windows.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}