/*
  Part of BrutusNEXT

   Class wrapping <svg> element.
*/

import { Component } from "../../Client/Gui/Component";

export class SvgComponent extends Component
{
  constructor
  (
    parent: Component,
    name: string,
    insertMode = Component.InsertMode.APPEND
  )
  {
    super
    (
      parent,
      document.createElementNS("http://www.w3.org/2000/svg", "svg"),
      name,
      insertMode
    );
  }

  public setRelativePosition(x: number, y: number): void
  {
    this.element.setAttribute("x", `${String(x)}%`);
    this.element.setAttribute("y", `${String(y)}%`);
  }
}