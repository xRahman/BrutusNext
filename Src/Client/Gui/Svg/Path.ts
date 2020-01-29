/*
  Part of BrutusNEXT

   Class wrapping SVG <line> element
*/

import { CssColor } from "../../../Client/Gui/CssColor";
import { Dom } from "../../../Client/Gui/Dom";
import { Component } from "../../../Client/Gui/Component";

export class Path extends Component
{
  constructor
  (
    parent: Component | "No parent",
    name = "path",
    insertMode: Dom.InsertMode = "APPEND"
  )
  {
    super(parent, Dom.createPath(), name, insertMode);
  }

  // ---------------- Public methods --------------------

  public draw
  (
    pathData: string
  )
  : void
  {
    this.element.setAttribute("d", pathData);
  }

  public setColor(color: CssColor): void
  {
    Dom.setLineColor(this.element, color);
  }
}