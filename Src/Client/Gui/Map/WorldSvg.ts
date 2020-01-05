/*
  Part of BrutusNEXT

  Svg container for everything in the world
*/

import { Gui } from "../../../Client/Gui/Gui";
import { RoomsSvg } from "../../../Client/Gui/Map/RoomsSvg";
import { ExitsSvg } from "../../../Client/Gui/Map/ExitsSvg";
import { MapCenterer } from "../../../Client/Gui/Map/MapCenterer";
import { MapZoomer } from "../../../Client/Gui/Map/MapZoomer";

export class WorldSvg extends MapZoomer
{
  private readonly roomsSvg: RoomsSvg;
  private readonly exitsSvg: ExitsSvg;

  constructor(parent: MapCenterer, name = "world")
  {
    super(parent, name);

    // Order of creation determines drawing order.
    this.exitsSvg = Gui.setExitsSvg(new ExitsSvg(this));
    this.roomsSvg = Gui.setRoomsSvg(new RoomsSvg(this));
  }

  // ---------------- Private methods -------------------
}