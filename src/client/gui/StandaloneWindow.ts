/*
  Part of BrutusNEXT

  Abstract ancestor of standalone windows containing a form.
*/

'use strict';

import {Utils} from '../../shared/lib/utils/Utils';
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

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // ~ Overrides Window.create().
  public create(param: Window.CreateParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        windowCss:   { sClass: StandaloneWindow.S_CSS_CLASS },
        contentCss:   { sClass: StandaloneWindow.CONTENT_S_CSS_CLASS },
        titleBarCss: { sClass: StandaloneWindow.TITLE_BAR_S_CSS_CLASS },
        titleCss:    { sClass: StandaloneWindow.TITLE_S_CSS_CLASS }
      }
    );

    super.create(param);
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
  // protected createEmptyLine
  // (
  //   {
  //     sCssClass
  //   }:
  //   {
  //     sCssClass?: string;
  //   }
  //   = {}
  // )
  // {
  //   return this.createDiv
  //   (
  //     {
  //       $parent: this.$content,
  //       sCssClass: sCssClass,
  //       text: Component.EMPTY_LINE_TEXT
  //     }
  //   );
  // }

  protected createLinkContainer
  (
    {
      sCssClass = StandaloneWindow.TEXT_S_CSS_CLASS
    }:
    {
      sCssClass?: string;
    }
    = {}
  )
  {
    return this.createDiv
    (
      {
        $parent: this.$content,
        sCssClass: sCssClass
      }
    );
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

}