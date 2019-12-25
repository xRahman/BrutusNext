/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Element } from "../../Client/Gui/Element";
import { Component } from "../../Client/Gui/Component";

export class Text extends Component
{
  constructor
  (
    parent: HTMLElement,
    name = "text"
  )
  {
    super(Element.createDiv(parent, name));
  }
}