/*
  Part of BrutusNEXT

  A window with title in the center of the screen
*/

import { Body } from "../../Client/Gui/Body";
import { TitledWindow } from "../../Client/Gui/TitledWindow";

export class CenteredTitledWindow extends TitledWindow
{
  // ! Throws an exception on error.
  constructor
  (
    parent: Body,
    name = "centered_titled_window",
    title = ""
  )
  {
    super(parent, name, title);
  }
}