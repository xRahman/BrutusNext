/*
  Part of BrutusNEXT

   Class wrapping SVG <defs> element
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Component } from "../../../Client/Gui/Component";

export class Defs extends Component
{
  constructor
  (
    parent: Component | "No parent",
    name = "defs",
    insertMode: Dom.InsertMode = "APPEND"
  )
  {
    super(parent, Dom.createDefs(), name, insertMode);
  }
}