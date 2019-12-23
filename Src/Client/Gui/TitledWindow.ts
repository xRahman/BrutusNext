/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { Css } from "../../Client/Gui/Css";
import { Element } from "../../Client/Gui/Element";
import { Component } from "../../Client/Gui/Component";
import { Window } from "../../Client/Gui/Window";
import { TitleBar } from "../../Client/Gui/TitleBar";

export class TitledWindow extends Window
{
  protected static readonly css = new Css
  (
    {
      // ------- Children size and positioning -------
      display: "grid",
      gridTemplateColumns: "1",
      gridColumnGap: "0px",
      gridTemplateRows: "2",
      gridRowGap: "0px",
      gridTemplateAreas: `"titlebar" "content"`
    }
  ).extends(Window.css);

  private static readonly contentCss = new Css
  (
    {
      // ------------- Size and position -------------
      gridArea: "content",

      // ---- Border, margin, padding and outline ----
      padding: "1rem"
    }
  ).extends(Component.css);

  // ---------------- Protected data --------------------

  protected titleBar: TitleBar;
  protected contentElement: HTMLElement;

  // ! Throws an exception on error.
  constructor
  (
    parent: HTMLElement,
    name = "titled_window",
    css = TitledWindow.css
  )
  {
    super(parent, name, css);

    this.titleBar = this.createTitleBar();
    this.contentElement = this.createContentElement();
  }

  // constructor
  // (
  //   {
  //     windowParam = {},
  //     titleBarParam = {},
  //     titleParam = {},
  //     contentParam = {}
  //   }
  //   : TitledWindow.Param = {}
  // )
  // {
  //   super
  //   (
  //     Utils.applyDefaults(windowParam, { name: 'titled_window' })
  //   );

  //   this.createTitleBar(titleBarParam, titleParam);
  //   this.createContent(contentParam);
  // }

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

  // protected createTitleBar
  // (
  //   titleBarParam: Component.DivParam,
  //   titleParam: Component.TitleParam
  // )
  // {
  //   if (this.$element === null)
  //   {
  //     ERROR("Unexpected 'null' value");
  //     return;
  //   }

  //   Utils.applyDefaults
  //   (
  //     titleBarParam,
  //     {
  //       name: 'title_bar',
  //       $parent: this.$element,
  //       gCssClass: Component.TITLE_BAR_G_CSS_CLASS,
  //       sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS
  //     }
  //   );

  //   this.$titleBar = this.$createDiv(titleBarParam);

  //   this.createWindowTitle(titleParam);
  // }

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

  // protected createContent(param: Component.DivParam = {})
  // {
  //   if (this.$element === null)
  //   {
  //     ERROR("Unexpected 'null' value");
  //     return;
  //   }

  //   Utils.applyDefaults
  //   (
  //     param,
  //     {
  //       name: 'window_content',
  //       $parent: this.$element,
  //       sCssClass: TitledWindow.CONTENT_S_CSS_CLASS
  //     }
  //   );

  //   this.$content = this.$createDiv(param);
  // }

  // ---------------- Private methods -------------------

  private createTitleBar(): TitleBar
  {
    return new TitleBar(this.element, "window_title_bar");
  }

  private createContentElement(): HTMLElement
  {
    const contentElement = Element.createDiv
    (
      this.element,
      "window_content",
      TitledWindow.contentCss
    );

    return contentElement;
  }
}