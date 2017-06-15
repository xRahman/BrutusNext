/*
  Part of BrutusNEXT

  Implements draggble and resizable window within the browser viewport.
*/

'use strict';

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

  // --- Jquery elements ---

  $window = null;
  $title = null;
  $titleBar = null;
  $content = null;

  // ----------------- Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  public getTitleBarId() { return this.id + '_titlebar'; }
  public getTitleId() { return this.id + '_title'; }
  public getContentId() { return this.id + '_content'; }

  // ---------------- Public methods --------------------

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
      this.id,
      Window.CSS_CLASS
    );

    this.$titleBar = this.createTitleBar();
    this.$window.append(this.$titleBar);

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
      this.getContentId(),
      Window.CONTENT_CSS_CLASS
    );
  }

  // -> Returns created jquery element.
  protected createTitleBar()
  {
    let $titleBar = this.createDiv
    (
      this.getTitleBarId(),
      Window.TITLE_BAR_CSS_CLASS
    );

    this.$title = this.createTitle
    (
      this.getTitleId(),
      Window.TITLE_CSS_CLASS
    );
    this.$title.text('New window');
    $titleBar.append(this.$title);

    return $titleBar;
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

}