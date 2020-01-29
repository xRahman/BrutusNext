/*
  Part of BrutusNEXT

   Class wrapping SVG <line> element
*/

import { CssColor } from "../../../Client/Gui/CssColor";
import { Dom } from "../../../Client/Gui/Dom";
import { Component } from "../../../Client/Gui/Component";

export class Line extends Component
{
  constructor
  (
    parent: Component | "No parent",
    name = "line",
    insertMode: Dom.InsertMode = "APPEND"
  )
  {
    super(parent, Dom.createLine(), name, insertMode);
  }

  // ---------------- Public methods --------------------

  public draw
  (
    from: { xPixels: number, yPixels: number },
    to: { xPixels: number, yPixels: number }
  )
  : void
  {
    this.element.setAttribute("x1", String(from.xPixels));
    this.element.setAttribute("y1", String(from.yPixels));
    this.element.setAttribute("x2", String(to.xPixels));
    this.element.setAttribute("y2", String(to.yPixels));
  }

  public setColor(color: CssColor): void
  {
    Dom.setLineColor(this.element, color);
  }

  public setMarkerEnd(id: string): void
  {
    this.element.setAttribute("marker-end", `url(#${id})`);
  }
}