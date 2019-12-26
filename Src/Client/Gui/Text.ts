/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Element } from "../../Client/Gui/Element";
import { Component } from "../../Client/Gui/Component";
import { TextColors } from "../../Client/Gui/TextColors";

export class Text extends Component
{
  constructor
  (
    parent: HTMLElement,
    coloredText: string,
    name = "text"
  )
  {
    super(Element.createSpan(parent, name, TextColors.htmlize(coloredText)));
  }
}