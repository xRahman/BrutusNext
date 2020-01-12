/*
  Part of BrutusNEXT

   Class wrapping <svg> element.
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Component } from "../../../Client/Gui/Component";

export class Svg extends Component
{
  constructor
  (
    parent: Component,
    name: string,
    insertMode = Dom.InsertMode.APPEND
  )
  {
    super(parent, Dom.createSvg(), name, insertMode);
  }

  public setSize(widthPixels: number, heightPixels: number): void
  {
    Dom.setWidth(this.element, widthPixels);
    Dom.setHeight(this.element, heightPixels);
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