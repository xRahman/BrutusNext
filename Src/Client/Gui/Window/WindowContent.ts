/*
  Part of BrutusNEXT

  Window content container
*/

import { Window } from "../../../Client/Gui/Window/Window";
import { Div } from "../../../Client/Gui/Html/Div";

export class WindowContent extends Div
{
  // ! Throws an exception on error.
  constructor
  (
    protected parent: Window,
    name = "window_content"
  )
  {
    super(parent, name);
  }
}