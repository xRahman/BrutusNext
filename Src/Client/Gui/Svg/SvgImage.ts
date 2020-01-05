/*
  Part of BrutusNEXT

   Class wrapping <svg> element.
*/

import { Component } from "../../../Client/Gui/Component";
import { SvgElement } from "../../../Client/Gui/Svg/SvgElement";
import { SvgImageElement } from "../../../Client/Gui/Svg/SvgImageElement";
import { SvgComponent } from "../../../Client/Gui/Svg/SvgComponent";

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
    SvgImageElement.setTexture(this.element as SVGImageElement, path);
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
}