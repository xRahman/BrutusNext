/*
  Part of BrutusNEXT

  Window with a titlebar and content
*/

import { TitleBar } from "../../Client/Gui/TitleBar";
import { WindowContent } from "../../Client/Gui/WindowContent";
import { Window } from "../../Client/Gui/Window";

export class TitledWindow extends Window
{
  // ---------------- Protected data --------------------

  protected titleBar: TitleBar;
  protected content: WindowContent;

  // ! Throws an exception on error.
  constructor
  (
    parent: HTMLElement,
    name = "titled_window"
  )
  {
    super(parent, name);

    this.titleBar = this.createTitleBar();
    this.content = this.createContent();
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

  private createContent(): WindowContent
  {
    return new WindowContent(this.element);
  }
}