/*
  Part of BrutusNEXT

  Lonely window at the center of the screen.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {Windows} from '../../../client/gui/window/Windows';
import {TitledWindow} from '../../../client/gui/window/TitledWindow';

export class StandaloneWindow extends TitledWindow
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
      {
        windowParam: Utils.applyDefaults
        (
          windowParam,
          {
            name: 'standalone_window',
            sCssClass: StandaloneWindow.S_CSS_CLASS
          }
        ),
        titleBarParam,
        titleParam: Utils.applyDefaults
        (
          titleParam,
          { sCssClass: StandaloneWindow.TITLE_S_CSS_CLASS }
        ),
        contentParam: Utils.applyDefaults
        (
          contentParam,
          { sCssClass: StandaloneWindow.CONTENT_S_CSS_CLASS }
        )
      }
    );
  }

  // -------------- Static class data -------------------

  protected static get S_CSS_CLASS()
    { return 'S_StandaloneWindow'; }
  protected static get TITLE_S_CSS_CLASS()
    { return 'S_StandaloneWindow_Title'; }
  protected static get CONTENT_S_CSS_CLASS()
    { return 'S_StandaloneWindow_Content'; }
  protected static get TEXT_S_CSS_CLASS()
    { return 'S_StandaloneWindow_Text'; }

  // ---------------- Public methods --------------------

  // ~ Overrides Window.showByState().
  public showByState(state: ClientApp.State)
  {
    // 'showByState()' returns 'true' if window actually
    // changes state from 'hidden' to 'shown'.
    if (super.showByState(state))
    {
      Windows.activeStandaloneWindow = this;
      return true;
    }
    
    return false;
  }

  // --------------- Protected methods ------------------

  protected createEmptyLine(param: Component.DivParam = {})
  {
    if (this.$content === null)
    {
      ERROR("Unexpected 'null' value");
      return null;
    }

    Utils.applyDefaults
    (
      param,
      {
        $parent: this.$content,
        sCssClass: StandaloneWindow.TEXT_S_CSS_CLASS
      }
    );

    this.$createEmptyLine(param);
  }

  protected createTextContainer(param: Component.DivParam = {})
  {
    if (this.$content === null)
    {
      ERROR("Unexpected 'null' value");
      return null;
    }
    
    Utils.applyDefaults
    (
      param,
      {
        name: 'text_container',
        $parent: this.$content,
        sCssClass: StandaloneWindow.TEXT_S_CSS_CLASS
      }
    );

    return this.$createDiv(param);
  }

  // ---------------- Event handlers --------------------

  // Handles 'keydown' event fired on html document
  // (it means that this handler runs even if this
  //  window desn't have focus).
  public onKeyDown(event: JQueryKeyEventObject)
  {
    // Nothing here (this method may be overriden).
  }
}