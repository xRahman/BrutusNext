/*
  Part of BrutusNEXT

   Class wrapping SVG <circle> element.
*/

import { CssColor } from "../../../Client/Gui/CssColor";
import { Dom } from "../../../Client/Gui/Dom";
import { Component } from "../../../Client/Gui/Component";

export class Line extends Component
{
  constructor
  (
    parent: Component,
    name = "line",
    insertMode = Dom.InsertMode.APPEND
  )
  {
    super(parent, Dom.createLine(), name, insertMode);
  }

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
    this.element.setAttribute("stroke", color.toString());
  }
}