/*
  Part of BrutusNEXT

  Map window
*/

import { Component } from "../../../Client/Gui/Component";
import { Map } from "../../../Client/Gui/Map/Map";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class MapWindow extends TitledWindow
{
  // ---------------- Protected data --------------------

  protected map: Map;

  constructor(parent: Component)
  {
    super(parent, "map_window", "Map Window");

    this.map = new Map(this.content);

    this.visibility.set(Gui.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}