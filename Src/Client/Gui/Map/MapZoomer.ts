/*
  Part of BrutusNEXT

  Component that zooms the map
*/

import { MapCenterer } from "../../../Client/Gui/Map/MapCenterer";
import { PlayerPosition } from "../../../Client/Gui/Map/PlayerPosition";
import { WorldComponent } from "../../../Client/Gui/Map/WorldComponent";
import { G } from "../../../Client/Gui/Svg/G";

const MINIMUM_ZOOM_FACTOR = 0.5;
const MAXIMUM_ZOOM_FACTOR = 2;
const ZOOM_STEP = 0.2;

export class MapZoomer extends G
{
  private zoom = 1.0;

  private readonly playerPosition: PlayerPosition;
  private readonly world: WorldComponent;

  // ! Throws exception on error.
  constructor(protected parent: MapCenterer, name = "map_centerer")
  {
    super(parent, name);

    this.playerPosition = new PlayerPosition(this);

    // ! Throws exception on error.
    this.world = new WorldComponent(this);
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