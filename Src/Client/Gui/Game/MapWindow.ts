/*
  Part of BrutusNEXT

  Map window
*/

import { Component } from "../../../Client/Gui/Component";
import { MapSvg } from "../../../Client/Gui/Map/MapSvg";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/TitledWindow";

export class MapWindow extends TitledWindow
{
  // ---------------- Protected data --------------------

  protected map: MapSvg;

  constructor(parent: Component)
  {
    super(parent, "map_window", "Map Window");

    this.map = new MapSvg(this.content);

    this.visibility.set(Gui.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}