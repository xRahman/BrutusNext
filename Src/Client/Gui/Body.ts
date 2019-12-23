/*
  Part of BrutusNext

  Wraps <body> element
*/

import { Css } from "../../Client/Gui/Css";
import { Component } from "../../Client/Gui/Component";

const backgroundImage = "/Images/Background.jpg";

export class Body extends Component
{
  protected static readonly css = new Css
  (
    {
      // ------------- Size and position -------------
      width: "100%",
      height: "100%",
      minHeight: "100%",
      minWidth: "100%",
      position: "absolute",

      // ------- Children size and positioning -------
      display: "grid",
      gridTemplateColumns: "auto auto auto auto auto auto auto auto auto",
      gridColumnGap: "0.2rem",
      gridTemplateRows: "auto auto auto auto auto auto auto auto auto",
      gridRowGap: "0.2rem",

      // ---------------- Background -----------------
      backgroundColor: "black",
      backgroundImage: `url(${backgroundImage})`,
      // Following code makes the background image always cover whole area.
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      backgroundPosition: "center",
      // -webkit-background-size: cover;
      // -moz-background-size: cover;
      // -o-background-size: cover;
      backgroundSize: "cover",

      // ------------------- Text --------------------

      // -------------- Text selection ---------------
      // Disable text selection.
      // -khtml-user-select: none;
      // -moz-user-select: none;
      // -webkit-user-select: none;
      // -ms-user-select: none;
      // -o-user-select: none;
      userSelect: "none",

      // ------------------ Cursor -------------------
      // Set default cursor (otherwise text select cursor would
      // appear on components with disabled text selection)
      cursor: "default"
    }
  ).extends(Component.css);

  private static readonly body = new Body();

  constructor()
  {
    super(document.body);

    this.setCss(Body.css);
  }
}