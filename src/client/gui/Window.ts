/*
  Part of BrutusNEXT

  Implements draggble and resizable window within the browser viewport.
*/

'use strict';

import {Flags} from '../../shared/lib/utils/Flags';
import {Document} from '../../client/gui/Document';
import {ClientApp} from '../../client/lib/app/ClientApp';
import {Component} from '../../client/gui/Component';
import {MudColorComponent} from '../../client/gui/MudColorComponent';

import $ = require('jquery');

export class Window extends MudColorComponent
{
  /*
  protected static get CSS_CLASS() { return 'Window'; }
  protected static get TITLE_BAR_CSS_CLASS() { return 'WindowTitleBar'; }
  protected static get TITLE_CSS_CLASS() { return 'WindowTitle'; }
  protected static get CONTENT_CSS_CLASS() { return 'WindowContent'; }
  */

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

  // Sets text to 'title' element
  // (accepts plain text or mud colored string).
  public setTitle(title: string)
  {
    // First remove existing text title if there is any.
    this.$title.empty();

    if (title.indexOf('&') !== -1)
      this.$title.append(this.htmlizeMudColors(title));
    else
      // Use text color set in css if string isn't colored.
      this.$title.text(title);
  }

  public create
  (
    windowCssClass: string,
    contentCssClass: string,
    titleBarCssClass: string,
    titleCssClass: string,
  )
  {
    this.$window = Component.createDiv
    (
      Document.$body,
      windowCssClass
    );

    // Windows are created hidden.
    this.$window.hide();

    this.createTitleBar(titleBarCssClass, titleCssClass);
    this.createContent(contentCssClass);

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
  protected createContent(cssClass: string)
  {
    this.$content = Component.createDiv
    (
      this.$window,
      cssClass
    );

    return this.$content;
  }

  protected createTitleBar(titleBarCssClass: string, titleCssClass: string)
  {
    this.$titleBar = Component.createDiv
    (
      this.$window,
      titleBarCssClass
    );

    this.$title = Component.createTitle
    (
      this.$titleBar,
      titleCssClass
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