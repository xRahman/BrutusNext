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
    "name": "TextLink",
    "css":
    {
      // Proč?
      fontWeight: "bold",
      textShadow: "0 1px 0 rgba(0, 0, 0, 0.5)",
      // color: "rgb(210, 230, 250)"    // Text color.
      color: "rgb(43, 144, 255)",    // Text color.
      textDecoration: "none"
    },
    ":hover":
    {
      textDecoration: "underline"
    }
  }
);

export class TextLink extends Component
{
  // ! Throws an exception on error.
  constructor
  (
    parent: HTMLElement,
    name = "text_link"
  )
  {
    super(Element.createDiv(parent, name));
  }
}