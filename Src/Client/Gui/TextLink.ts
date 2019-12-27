/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Component } from "../../Client/Gui/Component";
import { Text } from "../../Client/Gui/Text";

export class TextLink extends Text
{
  // ! Throws an exception on error.
  constructor
  (
    parent: Component,
    coloredText: string,
    name = "text_link"
  )
  {
    super(parent, coloredText, name);
  }
}