/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Css } from "../../Client/Gui/Css";
import { Element } from "../../Client/Gui/Element";
import { Component } from "../../Client/Gui/Component";

export const WINDOW_CONTENT_GRID_AREA = "window_content";

const cssClass = Css.createClass
(
  {
    name: "WindowContent",
    css:
    {
      // ------------- Size and position -------------
      gridArea: `${WINDOW_CONTENT_GRID_AREA}`,

      // ---- Border, margin, padding and outline ----
      padding: "1rem"
    }
  }
);

export class WindowContent extends Component
{
  // ! Throws an exception on error.
  constructor
  (
    parent: HTMLElement,
    name = "window_content"
  )
  {
    super(Element.createDiv(parent, name));
  }
}