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
    {
      parent,
      name,
      widthPixels,
      heightPixels,
      imagePath,
      isCentered
    } :
    {
      parent: Component,
      name: string,
      widthPixels: number,
      heightPixels: number,
      imagePath: string,
      isCentered: boolean
    },
    insertMode = Component.InsertMode.APPEND
  )
  {
    super(parent, "image", name, insertMode);

    this.setSize(widthPixels, heightPixels);
    this.setImage(imagePath);

    if (isCentered)
      this.translate(-widthPixels / 2, -heightPixels / 2);
  }

  public setImage(path: string): void
  {
    this.element.setAttributeNS(SVG_XLINK_NAMESPACE, "href", path);
  }

  public setSize(widthPixels: number, heightPixels: number): void
  {
    SvgComponent.setWidthAndHeight(this.element, widthPixels, heightPixels);
  }
}