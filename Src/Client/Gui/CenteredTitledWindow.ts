/*
  Part of BrutusNEXT

  A window in the center of the screen
*/

import { Css } from "../../Client/Gui/Css";
import { TitledWindow } from "../../Client/Gui/TitledWindow";

export class CenteredTitledWindow extends TitledWindow
{
  public static css = Css.createClass
  (
    "CenteredTitledWindow",
    {
      base:
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
    }
  );

  // ! Throws an exception on error.
  constructor
  (
    parent: HTMLElement,
    name = "centered_titled_window"
  )
  {
    super(parent, name);

    this.setCssClass("CenteredTitledWindow");
  }
}