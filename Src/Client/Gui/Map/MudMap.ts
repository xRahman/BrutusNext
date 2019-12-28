/*
  Part of BrutusNEXT

  Svg map
*/

import { Component } from "../../../Client/Gui/Component";
import { MapCenteringContainer } from
  "../../../Client/Gui/Map/MapCeneringContainer";
import { SvgComponent } from "../../../Client/Gui/SvgComponent";

export class MudMap extends SvgComponent
{
  private readonly centeringContainer: MapCenteringContainer;

  constructor(parent: Component, name = "map")
  {
    super(parent, name);

    // Use another svg component to translate the map to the center
    // of parent element.
    this.centeringContainer = new MapCenteringContainer(this);
  }
}