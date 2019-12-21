/*
  Part of BrutusNext

  Wraps <html> element and html 'document'.
*/

import { Component } from "../../Client/Gui/Component";

export class Html extends Component
{
  // TODO: Tohle asi může bejt mimo classu.
  protected static css: Partial<CSSStyleDeclaration> =
  {
    height: "100%",
    outline: "0 none",
    margin: "0px",
    padding: "0px"
  };

  // ! Throws an exception on error.
  constructor(element: HTMLElement)
  {
    super(element);

    this.setCss(Html.css);

    // TODO: Proč tohle je v Html?
    // - asi to spíš hodit buď do Gui, nebo do Windows.
    window.addEventListener("resize", () => { onDocumentResize(); });
  }
}

// ---------------- Event handlers --------------------

function onDocumentResize(): void
{
  // Windows.onDocumentResize();
}