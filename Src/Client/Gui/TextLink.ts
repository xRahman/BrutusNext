/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Text } from "../../Client/Gui/Text";

export class TextLink extends Text
{
  // ! Throws an exception on error.
  constructor
  (
    parent: HTMLElement,
    coloredText: string,
    name = "text_link"
  )
  {
    super(parent, coloredText, name);
  }
}