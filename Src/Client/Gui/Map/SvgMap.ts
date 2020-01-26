/*
  Part of BrutusNEXT

  Map of the world
*/

import { Component } from "../../../Client/Gui/Component";
import { SvgMapCenterer } from "../../../Client/Gui/Map/SvgMapCenterer";
import { Svg } from "../../../Client/Gui/Svg/Svg";

export class SvgMap extends Svg
{
  private readonly mapCenterer: SvgMapCenterer;

  // ! Throws exception on error.
  constructor(parent: Component, name = "map")
  {
    super(parent, name);

    // ! Throws exception on error.
    // Use another svg component to translate the map to the center
    // of parent element.
    this.mapCenterer = new SvgMapCenterer(this);

    this.onwheel = (event) => { this.onWheel(event); };
  }

  // ---------------- Event handlers --------------------

  private onWheel(event: WheelEvent): void
  {
    event.preventDefault();

    if (event.deltaY > 0)
      this.mapCenterer.mapZoomer.zoomIn();

    if (event.deltaY < 0)
      this.mapCenterer.mapZoomer.zoomOut();
  }
}