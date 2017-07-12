/*
  Part of BrutusNEXT

  Abstract ancestor of standalone windows containing a form.
*/

'use strict';

import {ClientApp} from '../../client/lib/app/ClientApp';
import {Component} from '../../client/gui/Component';
import {Window} from '../../client/gui/Window';

import $ = require('jquery');

export class StandaloneWindow extends Window
{
  protected static get S_CSS_CLASS()
    { return 'S_StandaloneWindow'; }
  protected static get TITLE_BAR_S_CSS_CLASS()
    { return 'S_StandaloneWindow_TitleBar'; }
  protected static get TITLE_S_CSS_CLASS()
    { return 'S_StandaloneWindow_Title'; }
  protected static get CONTENT_S_CSS_CLASS()
    { return 'S_StandaloneWindow_Content'; }
  protected static get LINK_CONTAINER_S_CSS_CLASS()
    { return 'S_StandaloneWindow_LinkContainer'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides Window.create().
  public create
  (
    param: Window.CreateParam =
    {
      window_sCssClass: StandaloneWindow.S_CSS_CLASS,
      content_sCssClass: StandaloneWindow.CONTENT_S_CSS_CLASS,
      titleBar_sCssClass: StandaloneWindow.TITLE_BAR_S_CSS_CLASS,
      title_sCssClass: StandaloneWindow.TITLE_S_CSS_CLASS
    }
  )
  {
    super.create(param);
  }

  // --------------- Protected methods ------------------

  protected createEmptyLine
  (
    {
      sCssClass
    }:
    {
      sCssClass?: string;
    }
    = {}
  )
  {
    return Component.createDiv
    (
      {
        $container: this.$content,
        sCssClass: sCssClass,
        text: Component.EMPTY_LINE_TEXT
      }
    );
  }

  protected createLinkContainer
  (
    {
      sCssClass = StandaloneWindow.LINK_CONTAINER_S_CSS_CLASS
    }:
    {
      sCssClass?: string;
    }
    = {}
  )
  {
    return Component.createDiv
    (
      {
        $container: this.$content,
        sCssClass: sCssClass
      }
    );
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

}