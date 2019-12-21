/*
  Part of BrutusNext

  Wraps html <body> element.
*/

import { Component } from "../../Client/Gui/Component";

export class Body extends Component
{
  // TODO: Tohle asi může bejt mimo classu.
  protected static css: Partial<CSSStyleDeclaration> =
  {
    outline: "0 none",
    margin: "0px",
    padding: "0px",
    width: "100%",
    height: "100%",
    minHeight: "100%",
    minWidth: "100%",
    position: "absolute",

    // Disable text selection.
    webkitUserSelect: "none",
    userSelect: "none",

    // Set default cursor.
    // (otherwise text select cursor would appear on
    //  components with disabled text selection)
    cursor: "default"
  };

  // ! Throws an exception on error.
  constructor(element: HTMLElement)
  {
    super(element);

    this.setCss(Body.css);
  }
}