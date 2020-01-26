/*
  Part of BrutusNEXT

  Map window
*/

import { Body } from "../../../Client/Gui/Html/Body";
import { SvgMap } from "../../../Client/Gui/Map/SvgMap";
import { Gui } from "../../../Client/Gui/Gui";
import { TitledWindow } from "../../../Client/Gui/Window/TitledWindow";

export class MapWindow extends TitledWindow
{
  // ---------------- Protected data --------------------

  protected map: SvgMap;

  // ! Throws exception on error.
  constructor(protected parent: Body)
  {
    super(parent, "map_window", "Map Window");

    // ! Throws exception on error.
    this.map = new SvgMap(this.content);

    this.visibility.set(Gui.State.GAME);
  }

  // --------------- Public accessors -------------------

  // ----------------- Private data ---------------------

  // ---------------- Protected data --------------------

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------
}