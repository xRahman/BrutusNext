/*
  Part of BrutusNEXT

  Class wrapping <div> element.
*/

import { Component } from "../../Client/Gui/Component";

export abstract class DivComponent extends Component
{
  constructor
  (
    parent: Component,
    name: string,
    insertMode = Component.InsertMode.APPEND
  )
  {
    super(parent, document.createElement("div"), name, insertMode);
  }
}