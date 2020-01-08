/*
  Part of BrutusNEXT

  Map of the world
*/

import { Component } from "../../../Client/Gui/Component";
import { MapCenterer } from "../../../Client/Gui/Map/MapCenterer";
import { SvgComponent } from "../../../Client/Gui/Svg/SvgComponent";

export class MapComponent extends SvgComponent
{
  private readonly mapCenterer: MapCenterer;

  constructor(parent: Component, name = "map")
  {
    super(parent, "svg", name);

    // Use another svg component to translate the map to the center
    // of parent element.
    this.mapCenterer = new MapCenterer(this);

    this.element.onwheel = (event) => { this.onWheel(event); };
  }

  // ---------------- Event handlers --------------------

  private onWheel(event: WheelEvent): void
  {
    event.preventDefault();

    if (event.deltaY > 0)
      this.mapCenterer.world.zoomIn();

    if (event.deltaY < 0)
      this.mapCenterer.world.zoomOut();
  }
}