/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Component } from "../../Client/Gui/Component";
import { DivComponent } from "../../Client/Gui/DivComponent";

export class WindowContent extends DivComponent
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