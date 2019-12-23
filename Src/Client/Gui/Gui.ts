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

// const bodyElementCss: Partial<CSSStyleDeclaration> =
// {
//   outline: "0 none",
//   margin: "0px",
//   padding: "0px",
//   width: "100%",
//   height: "100%",
//   minHeight: "100%",
//   minWidth: "100%",
//   position: "absolute",

//   // Disable text selection.
//   webkitUserSelect: "none",
//   userSelect: "none",

//   // Set default cursor.
//   // (otherwise text select cursor would appear on
//   //  components with disabled text selection)
//   cursor: "default"
// };

const bodyElementCss: Partial<CSSStyleDeclaration> =
{
  outline: "0 none !important",
  margin: "0 !important",
  padding: "0 !important",

  width: "100%",
  height: "100%",
  minHeight: "100%",
  minWidth: "100%",
  position: "absolute",
  display: "flex",
  backgroundColor: "black",
  backgroundImage: "url(/Images/Background.jpg)",

  // Fonts are saved on server so we don't need alternatives.
  fontFamily: "CourierNew",
  fontSize: "1em",  // Browser default (usually 16px).

  /* Disable text selection */
  // -khtml-user-select: none;
  // -moz-user-select: none;
  // -webkit-user-select: none;
  // -ms-user-select: none;
  // -o-user-select: none;
  userSelect: "none",

  /*
    Set default cursor
    (otherwise text select cursor would appear on components
     with disabled text selection)
  */
  cursor: "default",

  /* Following code makes the background image always cover whole area */
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
  backgroundPosition: "center",
  // -webkit-background-size: cover;
  // -moz-background-size: cover;
  // -o-background-size: cover;
  backgroundSize: "cover"
};

export namespace Gui
{
  // ! Throws exception on error.
  export function init(): void
  {
    Element.setCss(document.documentElement, htmlElementCss);
    Element.setCss(document.body, bodyElementCss);

    Windows.init();
  }
}