/*
  Part of BrutusNEXT

   Class wrapping <span> element.
*/

import { Dom } from "../../Client/Gui/Dom";
import { Component } from "../../Client/Gui/Component";

export abstract class Span extends Component
{
  constructor
  (
    parent: Component,
    name: string,
    insertMode = Dom.InsertMode.APPEND
  )
  {
    super(parent, document.createElement("span"), name, insertMode);
  }
}