/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Css } from "../../Client/Gui/Css";
import { Element } from "../../Client/Gui/Element";
import { Component } from "../../Client/Gui/Component";

const cssClass = Css.createClass
(
  {
    name: "Text",
    css:
    {
      // ------------- Size and position -------------
      // gridArea: `${WindowContent.GRID_AREA}`,

      // ---- Border, margin, padding and outline ----
      // padding: "1rem"
    }
  }
);

export class Text extends Component
{
  // ! Throws an exception on error.
  constructor
  (
    parent: HTMLElement,
    name = "text"
  )
  {
    super(Element.createDiv(parent, name));
  }
}