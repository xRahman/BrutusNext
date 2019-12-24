/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Css } from "../../Client/Gui/Css";
import { Element } from "../../Client/Gui/Element";
import { Component } from "../../Client/Gui/Component";

export class Text extends Component
{
  protected static readonly css = new Css
  (
    {
      // ------------- Size and position -------------
      // gridArea: `${WindowContent.GRID_AREA}`,

      // ---- Border, margin, padding and outline ----
      // padding: "1rem"
    }
  ).extends(Component.css);

  // ! Throws an exception on error.
  constructor
  (
    parent: HTMLElement,
    name = "text",
    css = Text.css
  )
  {
    super(Element.createDiv(parent, name, css));
  }
}