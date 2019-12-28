/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Component } from "../../Client/Gui/Component";
import { Div } from "../../Client/Gui/Div";

export class WindowContent extends Div
{
  // ! Throws an exception on error.
  constructor
  (
    parent: Component,
    name = "window_content"
  )
  {
    super(parent, name);
  }
}