/*
  Part of BrutusNEXT

   Class wrapping SVG <g> element
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Component } from "../../../Client/Gui/Component";

export class G extends Component
{
  constructor
  (
    parent: Component | "No parent",
    name = "svg_container",
    insertMode: Dom.InsertMode = "APPEND"
  )
  {
    super(parent, Dom.createG(), name, insertMode);
  }

  // ---------------- Public methods --------------------

  public setPosition(xPixels: number, yPixels: number): void
  {
    // Use translate transformation because <g> element
    // doesn't have 'x' and 'y' attributes.
   this.translate(xPixels, yPixels);
  }

  public scale(scale: number): void
  {
    Dom.scale(this.element, scale);
  }

  public translate(xPixels: number, yPixels: number): void
  {
    // Use translate transformation because <g> element
    // doesn't have 'x' and 'y' attributes.
    Dom.translate(this.element, xPixels, yPixels);
  }

  public rotate(degrees: number, pivot?: Dom.Point): void
  {
    Dom.rotate(this.element, degrees);
  }

  public skewX(degrees: number): void
  {
    Dom.skewX(this.element, degrees);
  }

  public skewY(degrees: number): void
  {
    Dom.skewY(this.element, degrees);
  }
}