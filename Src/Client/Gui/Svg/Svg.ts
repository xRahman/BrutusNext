/*
  Part of BrutusNEXT

   Class wrapping <svg> element.
*/

import { Component } from "../../../Client/Gui/Component";
import { SvgElement } from "../../../Client/Gui/Svg/SvgElement";
import { SvgComponent } from "../../../Client/Gui/Svg/SvgComponent";

export class Svg extends SvgComponent
{
  constructor
  (
    parent: Component,
    name: string,
    insertMode = Component.InsertMode.APPEND
  )
  {
    super(parent, "svg", name, insertMode);
  }

  public setSize(widthPixels: number, heightPixels: number): void
  {
    SvgElement.setWidthAndHeight
    (
      this.element as SVGElement,
      widthPixels,
      heightPixels
    );
  }

  public setPosition(xPixels: number, yPixels: number): void
  {
    this.element.setAttribute("x", String(xPixels));
    this.element.setAttribute("y", String(yPixels));
  }

  public setRelativePosition(xPercent: number, yPercent: number): void
  {
    this.element.setAttribute("x", `${String(xPercent)}%`);
    this.element.setAttribute("y", `${String(yPercent)}%`);
  }
}