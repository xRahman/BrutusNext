/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Component } from "../../../Client/Gui/Component";
import { Span } from "../../../Client/Gui/Html/Span";
import { TextColors } from "../../../Client/Gui/Text/TextColors";

export class Text extends Span
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