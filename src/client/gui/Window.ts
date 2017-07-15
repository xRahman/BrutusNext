/*
  Part of BrutusNEXT

  Implements draggble and resizable window within the browser viewport.
*/

'use strict';

import {Utils} from '../../shared/lib/utils/Utils';
import {Flags} from '../../shared/lib/utils/Flags';
import {Document} from '../../client/gui/Document';
import {ClientApp} from '../../client/lib/app/ClientApp';
import {Component} from '../../client/gui/Component';
import {MudColors} from '../../client/gui/MudColors';

import $ = require('jquery');

export class Window extends Component
{
  protected static get S_CSS_CLASS()
    { return 'S_Window'; }
  protected static get TITLE_BAR_S_CSS_CLASS()
    { return 'S_WindowTitleBar'; }
  protected static get TITLE_S_CSS_CLASS()
    { return 'S_WindowTitle'; }
  protected static get CONTENT_S_CSS_CLASS()
    { return 'S_WindowContent'; }

  constructor()
  {
    super();
  }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // Prevents this window to show when app state is changed
  // (for example if player is disconnected, all game windows
  //  are hidden and login window is shown. When player logs
  //  back in, login window is hidden and all game windows are
  //  shown again - except those with 'closed' set to 'true').
  protected closed = false;


  // Determines app states at which this window is shown.
  protected flags = new Flags<ClientApp.State>();

  // --- Jquery elements ---

  protected $window = null;
  protected $title = null;
  protected $titleBar = null;
  protected $content = null;

  // ----------------- Private data ---------------------

  // Internal flag to prevent calling onHide() if window
  // is already hidden.
  private hidden = true;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  public getFlags() { return this.flags; }

  // ---------------- Public methods --------------------

  public showByState(state: ClientApp.State)
  {
    if (this.flags.isSet(state))
      this.show();
    else
      this.hide();
  }

  // Sets text to 'title' element
  // (accepts plain text or mud colored string).
  public setTitle(title: string)
  {
    this.createText
    (
      {
        $container: this.$title,
        text: title,
        insertMode: Component.InsertMode.REPLACE
      }
    );
  }

  public create(param: Window.CreateParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        windowCss:
        {
          gClass: Component.WINDOW_G_CSS_CLASS,
          sClass: Window.S_CSS_CLASS
        },
        contentCss:
        {
          gClass: Component.NO_GRAPHICS_G_CSS_CLASS,
          sClass: Window.CONTENT_S_CSS_CLASS
        },
        titleBarCss:
        {
          gClass: Component.TITLE_BAR_G_CSS_CLASS,
          sClass: Window.TITLE_BAR_S_CSS_CLASS
        },
        titleCss:
        {
          gClass: Component.NO_GRAPHICS_G_CSS_CLASS,
          sClass: Window.TITLE_S_CSS_CLASS
        }
      }
    );

    this.createWindow(param.windowCss);
    this.createTitleBar(param.titleBarCss, param.titleCss);
    this.createContent(param.contentCss);

    return this.$window;
  }

  // Executes when html document is fully loaded.
  public onDocumentReady() {}

  // Executes when html document is resized.
  public onDocumentResize() {}

  // --------------- Protected methods ------------------

  protected onShow() {}
  protected onHide() {}

  // ---------------- Private methods -------------------

  private hide()
  {
    if (this.hidden)
      return;

    this.onHide();
    this.$window.hide();
    this.hidden = true;
  }

  private show()
  {
    if (this.closed)
      return;

    if (!this.hidden)
      return;

    this.onShow();
    this.$window.show();
    this.hidden = false;
  }

  private createWindow(css: Window.Css)
  {
    this.$window = this.createDiv
    (
      {
        $container: Document.$body,
        sCssClass: css.gClass,
        gCssClass: css.sClass
      }
    );

    // Windows are created hidden.
    this.$window.hide();
  }

  private createTitleBar(titleBarCss: Window.Css, titleCss: Window.Css)
  {
    this.$titleBar = this.createDiv
    (
      {
        $container: this.$window,
        gCssClass: titleBarCss.gClass,
        sCssClass: titleBarCss.sClass
      }
    );

    this.$title = super.createTitle
    (
      {
        $container: this.$titleBar,
        gCssClass: titleCss.gClass,
        sCssClass: titleCss.sClass,
        text: "New window"
      }
    );
  }

  private createContent(css: Window.Css)
  {
    this.$content = this.createDiv
    (
      {
        $container: this.$window,
        sCssClass: css.gClass,
        gCssClass: css.sClass
      }
    );
  }

  // ---------------- Event handlers --------------------

}

// ------------------ Type declarations ----------------------

export module Window
{
  export interface Css
  {
    gClass?: string,
    sClass?: string
  }
  export interface CreateParam
  {
    windowCss?: Css,
    contentCss?: Css,
    titleBarCss?: Css,
    titleCss?: Css
  }
}