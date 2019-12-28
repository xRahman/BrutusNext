/*
  Part of BrutusNEXT

   Class wrapping <svg> element.
*/

import { Component } from "../../../Client/Gui/Component";
import { SvgComponent } from "../../../Client/Gui/Svg/SvgComponent";

const SVG_XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";

export class SvgImage extends SvgComponent
{
  constructor
  (
    parent: Component,
    name: string,
    insertMode = Component.InsertMode.APPEND
  )
  {
    super(parent, "image", name, insertMode);
  }

  public setImage(path: string): void
  {
    this.element.setAttributeNS(SVG_XLINK_NAMESPACE, "href", path);
  }
}