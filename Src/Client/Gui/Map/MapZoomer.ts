/*
  Part of BrutusNEXT

  Component that zooms the map
*/

/*
  Scale transform on MapZoomer scales everything inside it.
*/

import { G } from "../../../Client/Gui/Svg/G";

const MINIMUM_ZOOM_FACTOR = 0.5;
const MAXIMUM_ZOOM_FACTOR = 2;
const ZOOM_STEP = 0.2;

export class MapZoomer extends G
{
  private zoom = 1.0;

  // ---------------- Public methods --------------------

  public setZoom(zoomFactor: number): void
  {
    this.zoom = zoomFactor;

    if (this.zoom < MINIMUM_ZOOM_FACTOR)
      this.zoom = MINIMUM_ZOOM_FACTOR;

    if (this.zoom > MAXIMUM_ZOOM_FACTOR)
      this.zoom = MAXIMUM_ZOOM_FACTOR;

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
}