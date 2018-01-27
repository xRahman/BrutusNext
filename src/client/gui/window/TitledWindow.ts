/*
  Part of BrutusNEXT

  Window with titlebar and content.
*/

'use strict';

import {Utils} from '../../../shared/lib/utils/Utils';
import {Component} from '../../../client/gui/Component';
import {Window} from '../../../client/gui/window/Window';

export class TitledWindow extends Window
{
  constructor
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
    super
    (
      Utils.applyDefaults(windowParam, { name: 'titled_window' })
    );

    this.createTitleBar(titleBarParam, titleParam);
    this.createContent(contentParam);
  }

  // -------------- Static class data -------------------

  protected static get TITLE_BAR_S_CSS_CLASS()
    { return 'S_TitledWindow_TitleBar'; }
  protected static get TITLE_S_CSS_CLASS()
    { return 'S_TitledWindow_Title'; }
  protected static get CONTENT_S_CSS_CLASS()
    { return 'S_TitledWindow_Content'; }

  // ---------------- Protected data --------------------

  protected $title: JQuery | null = null;
  protected $titleBar: JQuery | null = null;
  protected $content: JQuery | null = null;

  // ---------------- Public methods --------------------

  // Sets text to 'title' element
  // (accepts plain text or mud colored string).
  public setTitle(title: string)
  {
    this.$createText
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
        $parent: this.$element,
        gCssClass: Component.TITLE_BAR_G_CSS_CLASS,
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS
      }
    );

    this.$titleBar = this.$createDiv(titleBarParam);

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

    this.$title = this.$createTitle(param);
  }

  protected createContent(param: Component.DivParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        name: 'window_content',
        $parent: this.$element,
        sCssClass: TitledWindow.CONTENT_S_CSS_CLASS
      }
    );

    this.$content = this.$createDiv(param);
  }
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