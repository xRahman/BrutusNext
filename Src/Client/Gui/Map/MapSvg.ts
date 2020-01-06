/*
  Part of BrutusNEXT

  Svg map
*/

import { Component } from "../../../Client/Gui/Component";
import { MapCenterer } from "../../../Client/Gui/Map/MapCenterer";
import { SvgComponent } from "../../../Client/Gui/Svg/SvgComponent";

export class MapSvg extends SvgComponent
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
    console.log("onWheel()");

    event.preventDefault();

    if (event.deltaY > 0)
      this.mapCenterer.mapZoomer.zoomIn();

    if (event.deltaY < 0)
      this.mapCenterer.mapZoomer.zoomOut();
  }
}