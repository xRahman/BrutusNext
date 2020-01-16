/*
  Part of BrutusNEXT

  Map window
*/

import { Body } from "../../../Client/Gui/Html/Body";
import { MapComponent } from "../../../Client/Gui/Map/MapComponent";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/Window/TitledWindow";

export class MapWindow extends TitledWindow
{
  // ---------------- Protected data --------------------

  protected map: MapComponent;

  // ! Throws exception on error.
  constructor(parent: Body)
  {
    super(parent, "map_window", "Map Window");

    // ! Throws exception on error.
    this.map = new MapComponent(this.content);

    this.visibility.set(Gui.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}