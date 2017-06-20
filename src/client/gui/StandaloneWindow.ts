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

  // ~ Overrides Window.create()
  public create
  (
    windowCssClass = StandaloneWindow.CSS_CLASS,
    contentCssClass = StandaloneWindow.CONTENT_CSS_CLASS,
    titleBarCssClass = StandaloneWindow.TITLE_BAR_CSS_CLASS,
    titleCssClass = StandaloneWindow.TITLE_CSS_CLASS,
  )
  {
    super.create
    (
      windowCssClass,
      contentCssClass,
      titleBarCssClass,
      titleCssClass,
    );
  }

  // --------------- Protected methods ------------------

  protected createLinkContainer
  (
    cssClass = StandaloneWindow.LINK_CONTAINER_CSS_CLASS
  )
  {
    return Component.createDiv
    (
      this.$content,
      cssClass
    );
  }

  protected createText
  (
    $container: JQuery,
    text: string,
    cssClass = StandaloneWindow.TEXT_CSS_CLASS
  )
  {
    return Component.createText
    (
      $container,
      cssClass,
      text
    );
  }

  protected createLinkText
  (
    $container: JQuery,
    text: string,
    cssClass = StandaloneWindow.LINK_TEXT_CSS_CLASS
  )
  {
    return Component.createTextLink
    (
      $container,
      cssClass,
      text
    );
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

}