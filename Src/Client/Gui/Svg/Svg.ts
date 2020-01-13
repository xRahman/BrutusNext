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

  // ---------------- Public methods --------------------

  public setSize(widthPixels: number, heightPixels: number): void
  {
    Dom.setPosition(this.element, widthPixels, heightPixels);
  }

  public setPosition(xPixels: number, yPixels: number): void
  {
    Dom.setPosition(this.element, xPixels, yPixels);
  }

  public setRelativePosition(xPercent: number, yPercent: number): void
  {
    Dom.setRelativePosition(this.element, xPercent, yPercent);
  }
}