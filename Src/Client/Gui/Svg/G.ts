/*
  Part of BrutusNEXT

   Class wrapping SVG <g> element.
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Component } from "../../../Client/Gui/Component";

export class G extends Component
{
  constructor
  (
    parent: Component,
    name = "svg_container",
    insertMode = Dom.InsertMode.APPEND
  )
  {
    super(parent, Dom.createG(), name, insertMode);
  }

  public setPosition(xPixels: number, yPixels: number): void
  {
    // Use translate transformation because <g> element
    // doesn't have 'x' and 'y' attributes.
    Dom.translate(this.element, xPixels, yPixels);
  }

  public scale(scale: number): void
  {
    Dom.scale(this.element, scale);
  }

  public translate(xPixels: number, yPixels: number): void
  {
    Dom.translate(this.element, xPixels, yPixels);
  }
}