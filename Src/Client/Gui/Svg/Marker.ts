/*
  Part of BrutusNEXT

   Class wrapping SVG <marker> element
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Defs } from "../../../Client/Gui/Svg/Defs";
import { Component } from "../../../Client/Gui/Component";

export class Marker extends Component
{
  constructor
  (
    parent: Defs | "No parent",
    name = "marker",
    insertMode: Dom.InsertMode = "APPEND"
  )
  {
    super(parent, Dom.createMarker(), name, insertMode);

    this.element.setAttribute("orient", "auto");
    this.element.setAttribute("markerUnits", "strokeWidth");
    this.element.setAttribute("markerWidth", "10");
    this.element.setAttribute("markerHeight", "10");
  }

  // ---------------- Public methods --------------------

  public setPivot(xPixels: number, yPixels: number): void
  {
    this.element.setAttribute("refX", String(xPixels));
    this.element.setAttribute("refY", String(yPixels));
  }
}