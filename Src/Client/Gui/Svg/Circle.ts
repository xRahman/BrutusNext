/*
  Part of BrutusNEXT

   Class wrapping SVG <circle> element.
*/

import { Component } from "../../../Client/Gui/Component";
import { SvgComponent } from "../../../Client/Gui/Svg/SvgComponent";

export class Circle extends SvgComponent
{
  constructor
  (
    parent: Component,
    name = "circle",
    insertMode = Component.InsertMode.APPEND
  )
  {
    super(parent, "circle", name, insertMode);
  }

  // ~ Overrides SvgComponent.setPosition().
  // Note that origin point of <circle> is in the middle.
  public setPosition(xPixels: number, yPixels: number): void
  {
    this.element.setAttribute("cx", String(xPixels));
    this.element.setAttribute("cy", String(yPixels));
  }

  // ~ Overrides SvgComponent.setPosition().
  // Note that origin point of <circle> is in the middle.
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