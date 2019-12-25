/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Element } from "../../Client/Gui/Element";
import { Component } from "../../Client/Gui/Component";

export class WindowContent extends Component
{
  // ! Throws an exception on error.
  constructor
  (
    parent: HTMLElement,
    name = "window_content"
  )
  {
    super(Element.createDiv(parent, name));
  }
}