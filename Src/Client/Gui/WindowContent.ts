/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Window } from "../../Client/Gui/Window";
import { Div } from "../../Client/Gui/Div";

export class WindowContent extends Div
{
  // ! Throws an exception on error.
  constructor
  (
    parent: Window,
    name = "window_content"
  )
  {
    super(parent, name);
  }
}