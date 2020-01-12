/*
  Part of BrutusNEXT

  Map of the world
*/

import { Component } from "../../../Client/Gui/Component";
import { MapCenterer } from "../../../Client/Gui/Map/MapCenterer";
import { Svg } from "../../../Client/Gui/Svg/Svg";

export class MapComponent extends Svg
{
  private readonly mapCenterer: MapCenterer;

  constructor(parent: Component, name = "map")
  {
    super(parent, name);

    // Use another svg component to translate the map to the center
    // of parent element.
    this.mapCenterer = new MapCenterer(this);

    this.onwheel = (event) => { this.onWheel(event); };
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