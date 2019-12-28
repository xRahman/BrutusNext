/*
  Part of BrutusNEXT

   Class wrapping <svg> element.
*/

import { Component } from "../../Client/Gui/Component";

export class SvgGComponent extends Component
{
  constructor
  (
    parent: Component,
    name = "svg_g_element",
    insertMode = Component.InsertMode.APPEND
  )
  {
    super
    (
      parent,
      document.createElementNS("http://www.w3.org/2000/svg", "g"),
      name,
      insertMode
    );
  }

  public setTransform(transform: string): void
  {
    this.element.setAttribute("transform", transform);
  }

  public setRelativePosition(x: number, y: number): void
  {
    this.element.setAttribute("x", `${String(x)}%`);
    this.element.setAttribute("y", `${String(y)}%`);
  }
}