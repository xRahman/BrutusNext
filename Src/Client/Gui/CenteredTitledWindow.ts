/*
  Part of BrutusNEXT

  A window in the center of the screen
*/

import { Component } from "../../Client/Gui/Component";
import { TitledWindow } from "../../Client/Gui/TitledWindow";

export class CenteredTitledWindow extends TitledWindow
{
  // ! Throws an exception on error.
  constructor
  (
    parent: Component,
    name = "centered_titled_window",
    title = ""
  )
  {
    super(parent, name, title);
  }
}