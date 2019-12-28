/*
  Part of BrutusNEXT

  Svg image reprezenting an incon on the map
*/

import { Component } from "../../../Client/Gui/Component";
import { SvgImage } from "../../../Client/Gui/Svg/SvgImage";

export class MapIcon extends SvgImage
{
  constructor
  (
    parent: Component,
    widthPixels: number,
    heightPixels: number,
    image: string,
    name = "icon"
  )
  {
    super(parent, name);

    this.setImage(image);

    // Note that size of the image doesn't matter, it will be
    // scaled to this widht and height.
    this.setSize(widthPixels, heightPixels);

    // Translate the icon so it's origin is in the middle.
    this.translate(-widthPixels / 2, -heightPixels / 2);
  }
}