/*
  Part of BrutusNEXT

  Map window
*/

import { Component } from "../../../Client/Gui/Component";
import { MapComponent } from "../../../Client/Gui/Map/MapComponent";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class MapWindow extends TitledWindow
{
  // ---------------- Protected data --------------------

  protected map: MapComponent;

  constructor(parent: Component)
  {
    super(parent, "map_window", "Map Window");

    this.map = new MapComponent(this.content);

    this.visibility.set(Gui.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}