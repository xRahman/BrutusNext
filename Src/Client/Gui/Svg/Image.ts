/*
  Part of BrutusNEXT

   Class wrapping <svg> element.
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Component } from "../../../Client/Gui/Component";

const SVG_XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";

export class Image extends Component
{
  constructor
  (
    parent: Component,
    name = "image",
    insertMode = Dom.InsertMode.APPEND
  )
  {
    super(parent, Dom.createImage(), name, insertMode);
  }

  public setImage(path: string): void
  {
    this.element.setAttributeNS(SVG_XLINK_NAMESPACE, "href", path);
  }

  public setSize
  (
    widthPixels: number,
    heightPixels: number,
    { centered = false }
  )
  : void
  {
    Dom.setWidth(this.element, widthPixels);
    Dom.setHeight(this.element, heightPixels);

    if (centered)
      Dom.translate(this.element, -widthPixels / 2, -heightPixels / 2);
  }
}