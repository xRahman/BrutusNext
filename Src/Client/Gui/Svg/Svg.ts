/*
  Part of BrutusNEXT

   Class wrapping <svg> element.
*/

import { Component } from "../../../Client/Gui/Component";
import { SvgComponent } from "../../../Client/Gui/Svg/SvgComponent";

export class Svg extends SvgComponent
{
  constructor
  (
    parent: Component,
    name: string,
    insertMode = Component.InsertMode.APPEND
  )
  {
    super(parent, "svg", name, insertMode);
  }
}