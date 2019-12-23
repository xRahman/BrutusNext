/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Css } from "../../Client/Gui/Css";
import { Element } from "../../Client/Gui/Element";
import { Component } from "../../Client/Gui/Component";

export class WindowContent extends Component
{
  public static readonly GRID_AREA = "title_bar";

  protected static readonly css = new Css
  (
    {
      // ------------- Size and position -------------
      gridArea: `${WindowContent.GRID_AREA}`,

      // ---- Border, margin, padding and outline ----
      padding: "1rem"
    }
  ).extends(Component.css);

  // ! Throws an exception on error.
  constructor
  (
    parent: HTMLElement,
    name = "window_content",
    css = WindowContent.css
  )
  {
    super(Element.createDiv(parent, name, css));
  }
}