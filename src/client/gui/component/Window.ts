/*
  Part of BrutusNEXT

  Implements draggble and resizable window within the browser viewport.
*/

'use strict';

import {Flags} from '../../../shared/lib/utils/Flags';
import {Document} from '../../../client/gui/Document';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {MudColorComponent} from
  '../../../client/gui/component/MudColorComponent';

import $ = require('jquery');

export class Window extends MudColorComponent
{
  protected static get CSS_CLASS() { return 'Window'; }
  protected static get TITLE_BAR_CSS_CLASS() { return 'WindowTitleBar'; }
  protected static get TITLE_CSS_CLASS() { return 'WindowTitle'; }
  protected static get CONTENT_CSS_CLASS() { return 'WindowContent'; }

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

  // Sets html-formatted text to 'title' element.
  public setTitle(title: string)
  {
    this.$title.html(title);
  }

  // -> Returns created jquery element.
  public create()
  {
    this.$window = this.createDiv
    (
      Document.$body,
      Window.CSS_CLASS
    );

    // Windows are created hidden.
    this.$window.hide();

    this.createTitleBar();

    this.$content = this.createContent();
    this.$window.append(this.$content);

    return this.$window;
  }

  // Executes when html document is fully loaded.
  public onDocumentReady()
  {
  }

  // Executes when html document is resized.
  public onDocumentResize()
  {
  }

  // --------------- Protected methods ------------------

  // This method is overriden by descendants.
  protected createContent()
  {
    return this.createDiv
    (
      this.$window,
      Window.CONTENT_CSS_CLASS
    );
  }

  // -> Returns created jquery element.
  protected createTitleBar()
  {
    this.$titleBar = this.createDiv
    (
      this.$window,
      Window.TITLE_BAR_CSS_CLASS
    );

    this.$title = this.createTitle
    (
      this.$titleBar,
      Window.TITLE_CSS_CLASS
    );
    this.$title.text('New window');
  }

  // ---------------- Private methods -------------------

  private hide()
  {
    this.$window.hide();
  }

  private show()
  {
    if (!this.closed)
      this.$window.show();
  }

  // ---------------- Event handlers --------------------

}