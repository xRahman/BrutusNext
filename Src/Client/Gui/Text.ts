/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Component } from "../../Client/Gui/Component";
import { SpanComponent } from "../../Client/Gui/SpanComponent";
import { TextColors } from "../../Client/Gui/TextColors";

export class Text extends SpanComponent
{
  constructor
  (
    parent: Component,
    coloredText: string,
    name = "text"
  )
  {
    super(parent, name);

    this.insertHtml(TextColors.htmlize(coloredText));
  }
}