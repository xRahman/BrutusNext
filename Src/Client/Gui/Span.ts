/*
  Part of BrutusNEXT

   Class wrapping <span> element.
*/

import { Component } from "../../Client/Gui/Component";

export abstract class Span extends Component
{
  constructor
  (
    parent: Component,
    name: string,
    insertMode = Component.InsertMode.APPEND
  )
  {
    super(parent, document.createElement("span"), name, insertMode);
  }
}