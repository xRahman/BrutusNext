/*
  Part of BrutusNEXT

  Window titlebar
*/

import { Css } from "../../Client/Gui/Css";
import { Element } from "../../Client/Gui/Element";
import { Component } from "../../Client/Gui/Component";

export class TitleBar extends Component
{
  protected static readonly css = new Css
  (
    {
      // ------------- Size and position -------------
      gridArea: "titlebar",

      // ---- Border, margin, padding and outline ----
      padding: "0.1rem",

      // ---------------- Background -----------------
      // background: "rgba(80, 80, 80, 0.6)",
      background: "linear-gradient"
        + "("
        + "  rgba(80, 80, 80, 0.6) 0%,"
        + "  rgba(110, 110, 110, 0.6) 5%,"
        + "  rgba(60, 60, 60, 0.6) 90%,"
        + "  rgba(30, 30, 30, 0.6) 100%"
        + ")",

      // ------------------- Text --------------------
      fontWeight: "bold",
      // Add '...' if text overflows.
      textOverflow: "ellipsis",
      textShadow: "0 1px 0 rgba(0, 0, 0, 0.5)",
      color: "rgb(210, 230, 250)" // Text color.
    }
  ).extends(Component.css);

  // ---------------- Protected data --------------------

  // protected title: HTMLElement;

  // ! Throws an exception on error.
  constructor(parent: HTMLElement, css?: Partial<CSSStyleDeclaration>)
  {
    super(Element.createDiv(parent, css ? css : TitleBar.css));

    // this.title = createTitleElement();
  }

  // -------------- Static class data -------------------

  // ---------------- Public methods --------------------

  // // Sets text to 'title' element
  // // (accepts plain text or mud colored string).
  // public setTitle(title: string)
  // {
  //   if (this.$title === null)
  //   {
  //     ERROR("Unexpected 'null' value");
  //     return;
  //   }

  //   this.$createText
  //   (
  //     {
  //       $parent: this.$title,
  //       text: title,
  //       insertMode: Component.InsertMode.REPLACE
  //     }
  //   );
  // }

  // --------------- Protected methods ------------------

  // protected createWindowTitle(param: Component.TitleParam = {})
  // {
  //   if (this.$titleBar === null)
  //   {
  //     ERROR("Unexpected 'null' value");
  //     return;
  //   }

  //   Utils.applyDefaults
  //   (
  //     param,
  //     {
  //       name: 'title',
  //       $parent: this.$titleBar,
  //       sCssClass: TitledWindow.TITLE_S_CSS_CLASS,
  //       text: 'New window'
  //     }
  //   );

  //   this.$title = this.$createTitle(param);
  // }

  // ---------------- Private methods -------------------
}