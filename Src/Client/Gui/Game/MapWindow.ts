/*
  Part of BrutusNEXT

  Map window
*/

import { Component } from "../../../Client/Gui/Component";
import { MudMap } from "../../../Client/Gui/Map/MudMap";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class MapWindow extends TitledWindow
{
  // ---------------- Protected data --------------------

  protected map: MudMap;

  constructor(parent: Component)
  {
    super(parent, "map_window", "Map Window");

    this.map = new MudMap(this.content);

    this.visibility.set(Gui.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}