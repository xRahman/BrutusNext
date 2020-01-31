/*
  Part of BrutusNEXT

  Component that zooms the map
*/

import "../../../Shared/Utils/Number";
// import { Number } from "../../../Shared/Utils/Number";
import { SvgMapCenterer } from "../../../Client/Gui/Map/SvgMapCenterer";
import { SvgPlayerPosition } from "../../../Client/Gui/Map/SvgPlayerPosition";
import { SvgWorld } from "../../../Client/Gui/Map/SvgWorld";
import { G } from "../../../Client/Gui/Svg/G";

const MAXIMUM_ZOOM_STEP = 4;
const MININUM_ZOOM_STEP = -4;
const ZOOM_FACTOR_PER_STEP = 0.2;

export class SvgMapZoomer extends G
{
  private zoomStep = 0;

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

  public zoomIn(): void
  {
    this.setZoomStep(this.zoomStep - 1);
  }

  public zoomOut(): void
  {
    this.setZoomStep(this.zoomStep + 1);
  }

  // ---------------- Private methods -------------------

  private setZoomStep(zoomStep: number): void
  {
    this.zoomStep = zoomStep.clampTo(MININUM_ZOOM_STEP, MAXIMUM_ZOOM_STEP);

    // if (zoomStep < MININUM_ZOOM_STEP)
    //   this.zoomStep = MININUM_ZOOM_STEP;

    // if (zoomStep > MAXIMUM_ZOOM_STEP)
    //   this.zoomStep = MAXIMUM_ZOOM_STEP;

    this.updateZoomFactor();
  }

  private updateZoomFactor(): void
  {
    const zoomFactor = (1 + ZOOM_FACTOR_PER_STEP) ** this.zoomStep;

    this.setZoomFactor(zoomFactor);
  }

  private setZoomFactor(zoomFactor: number): void
  {
    this.scale(zoomFactor);
  }
}