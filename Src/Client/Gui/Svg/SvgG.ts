/*
  Part of BrutusNEXT

   Class wrapping SVG <g> element.
*/

import { Component } from "../../../Client/Gui/Component";
import { SvgComponent } from "../../../Client/Gui/Svg/SvgComponent";

export class SvgG extends SvgComponent
{
  constructor
  (
    parent: Component,
    name = "svg_container",
    insertMode = Component.InsertMode.APPEND
  )
  {
    super(parent, "g", name, insertMode);
  }

  // ~ Overrides SvgComponent.setPosition().
  public setPosition(xPixels: number, yPixels: number): void
  {
    // Use translate transformation because <g> element
    // doesn't have 'x' and 'y' attributes.
    this.translate(xPixels, yPixels);
  }
}