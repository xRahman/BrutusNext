/*
  Part of BrutusNEXT

   Class wrapping SVG <circle> element.
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Component } from "../../../Client/Gui/Component";

export class Circle extends Component
{
  constructor
  (
    parent: Component,
    name = "circle",
    insertMode: Dom.InsertMode = "APPEND"
  )
  {
    super(parent, Dom.createCircle(), name, insertMode);
  }

  // Note that origin point of <circle> is in the middle.
  public setPosition(xPixels: number, yPixels: number): void
  {
    this.element.setAttribute("cx", String(xPixels));
    this.element.setAttribute("cy", String(yPixels));
  }

  // Note that origin of <circle> is in the middle.
  public setRelativePosition(xPercent: number, yPercent: number): void
  {
    this.element.setAttribute("cx", `${String(xPercent)}%`);
    this.element.setAttribute("cy", `${String(yPercent)}%`);
  }

  public setRadius(radiusPixels: number): void
  {
    this.element.setAttribute("r", String(radiusPixels));
  }
}