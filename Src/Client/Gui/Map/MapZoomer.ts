/*
  Part of BrutusNEXT

  Svg component that zooms the map
*/

/*
  Scale transform on MapZoomer scales everything inside it.
*/

import { Gui } from "../../../Client/Gui/Gui";
import { Component } from "../../../Client/Gui/Component";
import { RoomsSvg } from "../../../Client/Gui/Map/RoomsSvg";
import { ExitsSvg } from "../../../Client/Gui/Map/ExitsSvg";
import { G } from "../../../Client/Gui/Svg/G";

export class MapZoomer extends G
{
  private zoom = 1.0;

  private readonly roomsSvg: RoomsSvg;
  private readonly exitsSvg: ExitsSvg;

  constructor(parent: Component, name = "map_zoomer")
  {
    super(parent, name);

    this.roomsSvg = Gui.setRoomsSvg(new RoomsSvg(this));
    this.exitsSvg = Gui.setExitsSvg(new ExitsSvg(this));
  }

  public setZoom(zoomFactor: number): void
  {
    this.zoom = zoomFactor;

    this.scale(zoomFactor);
  }

  public getZoom(): number { return this.zoom; }
}