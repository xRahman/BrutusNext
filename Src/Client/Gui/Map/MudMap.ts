/*
  Part of BrutusNEXT

  Svg map
*/

import { Component } from "../../../Client/Gui/Component";
import { MapCenterer } from "../../../Client/Gui/Map/MapCenterer";
import { SvgComponent } from "../../../Client/Gui/Svg/SvgComponent";

export class MudMap extends SvgComponent
{
  private readonly mapCenterer: MapCenterer;

  constructor(parent: Component, name = "mud_map")
  {
    super(parent, "svg", name);

    // Use another svg component to translate the map to the center
    // of parent element.
    this.mapCenterer = new MapCenterer(this);
  }
}