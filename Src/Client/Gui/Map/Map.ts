/*
  Part of BrutusNEXT

  Svg map
*/

import { Component } from "../../../Client/Gui/Component";
import { SvgComponent } from "../../../Client/Gui/SvgComponent";

export class Map extends SvgComponent
{
  constructor(parent: Component, name = "map")
  {
    super(parent, name);
  }
}