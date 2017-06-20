/*
  Part of BrutusNEXT

  Abstract ancestor of windows containing a form.
*/

'use strict';

import {ClientApp} from '../../client/lib/app/ClientApp';
import {Component} from '../../client/gui/Component';
import {Window} from '../../client/gui/Window';
import {Form} from '../../client/gui/Form';

import $ = require('jquery');

export class FormWindow extends Window
{
  protected static get CSS_CLASS()
    { return 'FormWindow'; }
  protected static get TITLE_BAR_CSS_CLASS()
    { return 'FormWindow_TitleBar'; }
  protected static get TITLE_CSS_CLASS()
    { return 'FormWindow_Title'; }
  protected static get CONTENT_CSS_CLASS()
    { return 'FormWindow_Content'; }
  protected static get TEXT_CSS_CLASS()
    { return 'FormWindow_Text'; }
  protected static get LINK_TEXT_CSS_CLASS()
    { return 'FormWindow_LinkText'; }
  protected static get LINK_CONTAINER_CSS_CLASS()
     { return 'FormWindow_LinkContainer'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  protected form: Form = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides Window.create()
  public create
  (
    windowCssClass = FormWindow.CSS_CLASS,
    contentCssClass = FormWindow.CONTENT_CSS_CLASS,
    titleBarCssClass = FormWindow.TITLE_BAR_CSS_CLASS,
    titleCssClass = FormWindow.TITLE_CSS_CLASS,
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

  protected createLinkContainer(cssClass = FormWindow.LINK_CONTAINER_CSS_CLASS)
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
    cssClass = FormWindow.TEXT_CSS_CLASS
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
    cssClass = FormWindow.LINK_TEXT_CSS_CLASS
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