/*
  Part of BrutusNEXT

   Class wrapping <svg> element.
*/

import { Component } from "../../Client/Gui/Component";

export abstract class SvgComponent extends Component
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
      document.createElementNS("http://www.w3.org/2000/svg", "g"),
      name,
      insertMode
    );
  }
}