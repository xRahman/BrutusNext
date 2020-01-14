/*
  Part of BrutusNEXT

   Class wrapping SVG <image> element
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Component } from "../../../Client/Gui/Component";

export class Image extends Component
{
  private widthPixels = 0;
  private heightPixels = 0;
  private readonly centered: boolean;

  constructor
  (
    parent: Component | "No parent",
    name = "image",
    centered = true,
    insertMode: Dom.InsertMode = "APPEND"
  )
  {
    super(parent, Dom.createImage(), name, insertMode);

    this.centered = centered;
  }

  // ---------------- Public methods --------------------

  public setImage(path: string): void
  {
    Dom.setHref(this.element, path);
  }

  public setSize
  (
    widthPixels: number,
    heightPixels: number
  )
  : void
  {
    this.widthPixels = widthPixels;
    this.heightPixels = heightPixels;

    Dom.setSize(this.element, widthPixels, heightPixels);

    if (this.centered)
      this.center();
  }

  public setPosition(xPixels: number, yPixels: number): void
  {
    Dom.setPosition(this.element, xPixels, yPixels);

    if (this.centered)
      this.center();
  }

  public setRelativePosition(xPercent: number, yPercent: number): void
  {
    Dom.setRelativePosition(this.element, xPercent, yPercent);

    if (this.centered)
      this.center();
  }

  // ---------------- Private methods -------------------

  private center(): void
  {
    Dom.translate(this.element, -this.widthPixels / 2, -this.heightPixels / 2);
  }
}