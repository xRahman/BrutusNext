/*
  Part of BrutusNEXT

  Window with titlebar and content.
*/

'use strict';

import {Utils} from '../../shared/lib/utils/Utils';
import {Component} from '../../client/gui/Component';
import {Window} from '../../client/gui/Window';

export class TitledWindow extends Window
{
  protected static get TITLE_BAR_S_CSS_CLASS()
    { return 'S_TitledWindow_TitleBar'; }
  protected static get TITLE_S_CSS_CLASS()
    { return 'S_TitledWindow_Title'; }
  protected static get CONTENT_S_CSS_CLASS()
    { return 'S_TitledWindow_Content'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  protected $title: JQuery = null;
  protected $titleBar: JQuery = null;
  protected $content: JQuery = null;

  // ----------------- Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public create
  (
    {
      windowParam = {},
      titleBarParam = {},
      titleParam = {},
      contentParam = {}
    }
    : TitledWindow.Param = {}
  )
  {
    Utils.applyDefaults(windowParam, { name: 'titled_window' });

    super.create({ windowParam });

    this.createTitleBar(titleBarParam, titleParam);
    this.createContent(contentParam);
  }

  // Sets text to 'title' element
  // (accepts plain text or mud colored string).
  public setTitle(title: string)
  {
    this.createText
    (
      {
        $parent: this.$title,
        text: title,
        insertMode: Component.InsertMode.REPLACE
      }
    );
  }

  // --------------- Protected methods ------------------

  protected createTitleBar
  (
    titleBarParam: Component.DivParam,
    titleParam: Component.TitleParam
  )
  {
    Utils.applyDefaults
    (
      titleBarParam,
      {
        name: 'title_bar',
        $parent: this.$window,
        gCssClass: Component.TITLE_BAR_G_CSS_CLASS,
        ///sCssClass: TitledWindow.TITLE_BAR_S_CSS_CLASS
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS
      }
    );

    this.$titleBar = this.createDiv(titleBarParam);

    this.createWindowTitle(titleParam);
  }

  protected createWindowTitle(param: Component.TitleParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        name: 'title',
        $parent: this.$titleBar,
        sCssClass: TitledWindow.TITLE_S_CSS_CLASS,
        text: 'New window'
      }
    );

    this.$title = this.createTitle(param);
  }

  protected createContent(param: Component.DivParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        name: 'window_content',
        $parent: this.$window,
        sCssClass: TitledWindow.CONTENT_S_CSS_CLASS
      }
    );

    this.$content = this.createDiv(param);
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

}

// ------------------ Type Declarations ----------------------

export module TitledWindow
{
  export interface Param
  {
    windowParam?: Component.DivParam,
    titleBarParam?: Component.DivParam,
    titleParam?: Component.TitleParam,
    contentParam?: Component.DivParam
  }
}