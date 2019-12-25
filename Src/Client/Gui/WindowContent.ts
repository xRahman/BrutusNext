/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Css } from "../../Client/Gui/Css";
import { Element } from "../../Client/Gui/Element";
import { Component } from "../../Client/Gui/Component";

export class WindowContent extends Component
{
  public static readonly GRID_AREA = "window_content";

  public static css = Css.createClass
  (
    "WindowContent",
    {
      base:
      {
        // ------------- Size and position -------------
        gridArea: `${WindowContent.GRID_AREA}`,

        // ---- Border, margin, padding and outline ----
        padding: "1rem"
      }
    }
  );

  // ! Throws an exception on error.
  constructor
  (
    parent: HTMLElement,
    name = "window_content"
  )
  {
    super(Element.createDiv(parent, name));

    this.setCssClass("WindowContent");
  }
}