/*
  Part of BrutusNEXT

   Ancestor of all SVG components.
*/

import { SvgElement } from "../../../Client/Gui/Svg/SvgElement";
import { Component } from "../../../Client/Gui/Component";

export class SvgComponent extends Component
{
  constructor
  (
    parent: Component,
    elementType: SvgElement.Type,
    name: string,
    insertMode = Component.InsertMode.APPEND
  )
  {
    super
    (
      parent,
      SvgElement.create(elementType),
      name,
      insertMode
    );
  }

  // ---------------- Public methods --------------------

  public scale(scale: number): void
  {
    SvgElement.scale(this.element as SVGElement, scale);
  }

  public translate(xPixels: number, yPixels: number): void
  {
    SvgElement.translate(this.element as SVGElement, xPixels, yPixels);
  }
}