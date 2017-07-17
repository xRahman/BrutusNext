/*
  Part of BrutusNEXT

  Lonely window at the center of the screen.
*/

'use strict';

import {Utils} from '../../shared/lib/utils/Utils';
import {Component} from '../../client/gui/Component';
import {TitledWindow} from '../../client/gui/TitledWindow';

export class StandaloneWindow extends TitledWindow
{
  protected static get S_CSS_CLASS()
    { return 'S_StandaloneWindow'; }
  protected static get TITLE_S_CSS_CLASS()
    { return 'S_StandaloneWindow_Title'; }
  protected static get CONTENT_S_CSS_CLASS()
    { return 'S_StandaloneWindow_Content'; }
  protected static get TEXT_S_CSS_CLASS()
    { return 'S_StandaloneWindow_Text'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides TitledWindow.create().
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
    Utils.applyDefaults
    (
      windowParam,
      {
        name: 'standalone_window',
        sCssClass: StandaloneWindow.S_CSS_CLASS
      }
    );

    Utils.applyDefaults
    (
      titleParam,
      { sCssClass: StandaloneWindow.TITLE_S_CSS_CLASS }
    );

    Utils.applyDefaults
    (
      contentParam,
      { sCssClass: StandaloneWindow.CONTENT_S_CSS_CLASS }
    );

    super.create
    (
      {
        windowParam,
        titleBarParam,
        titleParam,
        contentParam
      }
    );
  }

  // --------------- Protected methods ------------------

  protected createEmptyLine(param: Component.DivParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        $parent: this.$content,
        sCssClass: StandaloneWindow.TEXT_S_CSS_CLASS
      }
    );

    return super.createEmptyLine(param);
  }

  protected createTextContainer(param: Component.DivParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        name: 'text_container',
        $parent: this.$content,
        sCssClass: StandaloneWindow.TEXT_S_CSS_CLASS
      }
    );

    return this.createDiv(param);
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

}