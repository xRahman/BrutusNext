/*
  Part of BrutusNEXT

  A window in the center of the screen
*/

import { Css } from "../../Client/Gui/Css";
import { Window } from "../../Client/Gui/Window";

export class CenteredTitledWindow extends Window
{
  protected static readonly css = new Css
  (
    {
      // ------------- Size and position -------------
      gridColumnStart: "1",
      gridColumnEnd: "last-line",
      gridRowStart: "1",
      gridRowEnd: "last-line",
      justifySelf: "center",
      alignSelf: "center",
      width: "20rem",
      // 'vw' means viewport width so this window won't be
      // wider than the viewport.
      maxWidth: "100vw",
      // 'vh' means viewport height so this window won't be
      // higher than the viewport.
      maxHeight: "100vh"
    }
  ).extends(Window.css);

  // ! Throws an exception on error.
  constructor(parent: HTMLElement)
  {
    super(parent, CenteredTitledWindow.css);
  }
}