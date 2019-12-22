/*
  Part of BrutusNext

  Keeps references to root html components
*/

import { Element } from "../../Client/Gui/Element";
import { Windows } from "../../Client/Gui/Windows";

const htmlElementCss: Partial<CSSStyleDeclaration> =
{
  height: "100%",
  outline: "0 none",
  margin: "0px",
  padding: "0px"
};

const bodyElementCss: Partial<CSSStyleDeclaration> =
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

export namespace Gui
{
  // ! Throws exception on error.
  export function init(): void
  {
    Element.setCss(document.documentElement, htmlElementCss);
    Element.setCss(document.body, bodyElementCss);
  }
}