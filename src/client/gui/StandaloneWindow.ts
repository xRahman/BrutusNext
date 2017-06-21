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
  protected static get CSS_CLASS()
    { return 'StandaloneWindow'; }
  protected static get TITLE_BAR_CSS_CLASS()
    { return 'StandaloneWindow_TitleBar'; }
  protected static get TITLE_CSS_CLASS()
    { return 'StandaloneWindow_Title'; }
  protected static get CONTENT_CSS_CLASS()
    { return 'StandaloneWindow_Content'; }
  protected static get TEXT_CSS_CLASS()
    { return 'StandaloneWindow_Text'; }
  protected static get LINK_TEXT_CSS_CLASS()
    { return 'StandaloneWindow_LinkText'; }
  protected static get LINK_CONTAINER_CSS_CLASS()
     { return 'StandaloneWindow_LinkContainer'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public create
  (
    {
      window_sCssClass = StandaloneWindow.CSS_CLASS,
      content_sCssClass = StandaloneWindow.CONTENT_CSS_CLASS,
      titleBar_sCssClass = StandaloneWindow.TITLE_BAR_CSS_CLASS,
      title_sCssClass = StandaloneWindow.TITLE_CSS_CLASS,
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

  protected _createLinkContainer
  (
    {
      sCssClass = StandaloneWindow.LINK_CONTAINER_CSS_CLASS
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

  protected _createText
  (
    {
      $container,
      text,
      sCssClass = StandaloneWindow.TEXT_CSS_CLASS
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

  protected _createLinkText
  (
    {
      $container,
      text,
      sCssClass = StandaloneWindow.LINK_TEXT_CSS_CLASS
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