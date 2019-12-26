/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Element } from "../../Client/Gui/Element";
import { Component } from "../../Client/Gui/Component";
import { MudColors } from "../../Client/Gui/MudColors";

export class Text extends Component
{
  constructor
  (
    parent: HTMLElement,
    coloredText: string,
    name = "text"
  )
  {
    super(Element.createSpan(parent, name, MudColors.htmlize(coloredText)));
  }
}