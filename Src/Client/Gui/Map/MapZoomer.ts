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

const MINIMUM_ZOOM = 0.2;
const MAXIMUM_ZOOM = 2;
const ZOOM_STEP = 0.2;

export class MapZoomer extends G
{
  private zoom = 1.0;

  private readonly roomsSvg: RoomsSvg;
  private readonly exitsSvg: ExitsSvg;

  constructor(parent: Component, name = "map_zoomer")
  {
    super(parent, name);

    // Order of creation determines drawing order.
    this.exitsSvg = Gui.setExitsSvg(new ExitsSvg(this));
    this.roomsSvg = Gui.setRoomsSvg(new RoomsSvg(this));
  }

  public setZoom(zoomFactor: number): void
  {
    this.zoom = zoomFactor;

    if (this.zoom < MINIMUM_ZOOM)
      this.zoom = MINIMUM_ZOOM;

    if (this.zoom > MAXIMUM_ZOOM)
      this.zoom = MAXIMUM_ZOOM;

    this.scale(zoomFactor);
  }

  public getZoom(): number { return this.zoom; }

  public zoomIn(): void
  {
    this.setZoom(this.zoom / (1 + ZOOM_STEP));
  }

  public zoomOut(): void
  {
    this.setZoom(this.zoom * (1 + ZOOM_STEP));
  }

  // ---------------- Private methods -------------------
}