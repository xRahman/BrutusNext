/*
  Part of BrutusNEXT

  Abstract ancestor of game windows.
*/

'use strict';

import {ClientApp} from '../../client/lib/app/ClientApp';
import {Window} from '../../client/gui/Window';

import $ = require('jquery');

export class GameWindow extends Window
{
  protected static get CSS_CLASS()
    { return 'GameWindow'; }
  protected static get TITLE_BAR_CSS_CLASS()
    { return 'GameWindow_TitleBar'; }
  protected static get TITLE_CSS_CLASS()
    { return 'GameWindow_Title'; }
  protected static get CONTENT_CSS_CLASS()
    { return 'GameWindow_Content'; }

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
    window_sCssClass = GameWindow.CSS_CLASS,
    content_sCssClass = GameWindow.CONTENT_CSS_CLASS,
    titleBar_sCssClass = GameWindow.TITLE_BAR_CSS_CLASS,
    title_sCssClass = GameWindow.TITLE_CSS_CLASS,
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

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

}