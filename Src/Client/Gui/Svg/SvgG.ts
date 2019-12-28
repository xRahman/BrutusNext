/*
  Part of BrutusNEXT

   Class wrapping <svg> element.
*/

import { Component } from "../../../Client/Gui/Component";
import { SvgComponent } from "../../../Client/Gui/Svg/SvgComponent";

export class SvgG extends SvgComponent
{
  constructor
  (
    parent: Component,
    name = "svg_g_container",
    insertMode = Component.InsertMode.APPEND
  )
  {
    super(parent, "g", name, insertMode);
  }
}