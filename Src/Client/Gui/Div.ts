/*
  Part of BrutusNEXT

  Class wrapping <div> element.
*/

import { Dom } from "../../Client/Gui/Dom";
import { Component } from "../../Client/Gui/Component";

export abstract class Div extends Component
{
  constructor
  (
    parent: Component,
    name: string,
    insertMode: Dom.InsertMode = "APPEND"
  )
  {
    super(parent, Dom.createDiv(), name, insertMode);
  }
}