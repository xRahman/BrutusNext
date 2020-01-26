/*
  Part of BrutusNEXT

  Component that zooms the map
*/

import { SvgMapCenterer } from "../../../Client/Gui/Map/SvgMapCenterer";
import { SvgPlayerPosition } from "../../../Client/Gui/Map/SvgPlayerPosition";
import { SvgWorld } from "../../../Client/Gui/Map/SvgWorld";
import { G } from "../../../Client/Gui/Svg/G";

const MINIMUM_ZOOM_FACTOR = 0.5;
const MAXIMUM_ZOOM_FACTOR = 2;
const ZOOM_STEP = 0.2;

export class SvgMapZoomer extends G
{
  private zoom = 1.0;

  private readonly playerPosition: SvgPlayerPosition;
  private readonly world: SvgWorld;

  // ! Throws exception on error.
  constructor(protected parent: SvgMapCenterer, name = "map_zoomer")
  {
    super(parent, name);

    this.playerPosition = new SvgPlayerPosition(this);

    // ! Throws exception on error.
    this.world = new SvgWorld(this);
  }

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