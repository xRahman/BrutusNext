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
  protected static get TEXT_S_CSS_CLASS()
    { return 'S_StandaloneWindow_Text'; }
  protected static get LINK_TEXT_S_CSS_CLASS()
    { return 'S_StandaloneWindow_LinkText'; }
  protected static get LINK_CONTAINER_S_CSS_CLASS()
    { return 'S_StandaloneWindow_LinkContainer'; }
  /// To be deleted.
  // protected static get EMPTY_LINE_S_CSS_CLASS()
  //   { return 'S_StandaloneWindow_EmptyLine'; }

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
    {
      window_sCssClass = StandaloneWindow.S_CSS_CLASS,
      content_sCssClass = StandaloneWindow.CONTENT_S_CSS_CLASS,
      titleBar_sCssClass = StandaloneWindow.TITLE_BAR_S_CSS_CLASS,
      title_sCssClass = StandaloneWindow.TITLE_S_CSS_CLASS,
    }:
    {
      window_sCssClass?: string;
      content_sCssClass?: string;
      titleBar_sCssClass?: string;
      title_sCssClass?: string;
    }
    = {}
  )
  {
    super.create
    (
      {
        window_sCssClass: window_sCssClass,
        content_sCssClass: content_sCssClass,
        titleBar_sCssClass: titleBar_sCssClass,
        title_sCssClass: title_sCssClass,
      }
    );
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

  protected createText
  (
    {
      $container,
      text,
      sCssClass = StandaloneWindow.TEXT_S_CSS_CLASS
    }:
    {
      $container: JQuery;
      text: string;
      sCssClass?: string;
    }
  )
  {
    return Component.createText
    (
      {
        $container: $container,
        sCssClass: sCssClass,
        text: text
      }
    );
  }

  protected createLinkText
  (
    {
      $container,
      text,
      sCssClass = StandaloneWindow.LINK_TEXT_S_CSS_CLASS
    }:
    {
      $container: JQuery;
      text: string;
      sCssClass?: string;
    }
  )
  {
    return Component.createTextLink
    (
      {
        $container: $container,
        sCssClass: sCssClass,
        text: text
      }
    );
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

}