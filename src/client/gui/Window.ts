/*
  Part of BrutusNEXT

  Implements draggble and resizable window within the browser viewport.
*/

'use strict';

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
    Component.setText(this.$title, title);
  }

  public create
  (
    {
      window_gCssClass = Component.WINDOW_G_CSS_CLASS,
      window_sCssClass = Window.S_CSS_CLASS,
      content_gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
      content_sCssClass = Window.CONTENT_S_CSS_CLASS,
      titleBar_gCssClass = Component.TITLE_BAR_G_CSS_CLASS,
      titleBar_sCssClass = Window.TITLE_BAR_S_CSS_CLASS,
      title_gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
      title_sCssClass = Window.TITLE_S_CSS_CLASS
    }
    : Window.CreateParam = {}
  )
  {
    this.$window = Component.createDiv
    (
      {
        $container: Document.$body,
        sCssClass: window_gCssClass,
        gCssClass: window_sCssClass
      }
    );

    // Windows are created hidden.
    this.$window.hide();

    this.createTitleBar(titleBar_gCssClass, titleBar_sCssClass);
    this.createTitle(title_gCssClass, title_sCssClass);
    this.createContent(content_gCssClass, content_sCssClass);

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

  private createTitleBar(gCssClass: string, sCssClass: string)
  {
    this.$titleBar = Component.createDiv
    (
      {
        $container: this.$window,
        gCssClass,
        sCssClass
      }
    );
  }

  private createTitle(gCssClass: string, sCssClass: string)
  {
    this.$title = Component.createTitle
    (
      {
        $container: this.$titleBar,
        gCssClass,
        sCssClass
      }
    );

    this.$title.text('New window');
  }

  private createContent(gCssClass: string, sCssClass: string)
  {
    this.$content = Component.createDiv
    (
      {
        $container: this.$window,
        gCssClass,
        sCssClass
      }
    );
  }

  // ---------------- Event handlers --------------------

}

// ------------------ Type declarations ----------------------

export module Window
{
  export interface CreateParam
  {
    window_sCssClass?: string;
    window_gCssClass?: string;
    content_sCssClass?: string;
    content_gCssClass?: string;
    titleBar_sCssClass?: string;
    titleBar_gCssClass?: string;
    title_sCssClass?: string;
    title_gCssClass?: string;
  }
}