/*
  Part of BrutusNEXT

  Implements draggble and resizable window within the browser viewport.
*/

'use strict';

///import MudColorComponent = require('../component/MudColorComponent');
import {MudColorComponent} from '../component/MudColorComponent';

import $ = require('jquery');
///import * as $ from 'jquery';

export class Window extends MudColorComponent
{
  public static get CSS_CLASS() { return 'Window'; }
  public static get TITLE_BAR_CSS_CLASS() { return 'WindowTitleBar'; }
  public static get TITLE_CSS_CLASS() { return 'WindowTitle'; }
  public static get CONTENT_CSS_CLASS() { return 'WindowContent'; }

  constructor()
  {
    super();
  }

  // -------------- Static class data -------------------


  //----------------- Protected data --------------------

  // --- Jquery elements ---

  $window = null;
  $title = null;
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
    this.$window = this.createWindow();

    // Create jquery element 'title_bar'.
    let $titleBar = this.createTitleBar();
    // Put it in the 'window' element.
    this.$window.append($titleBar);

    // Create jquery element 'content'.
    this.$content = this.createContent();
    // Put it in the 'window' element.
    this.$window.append(this.$content);

    return this.$window;
  }

  // --------------- Protected methods ------------------

  // -> Returns created jquery element.
  protected createWindow()
  {
    // Create a DOM element.
    let window = this.createDivElement
    (
      this.id,
      Window.CSS_CLASS
    );

    // Create jquery element from the DOM element.
    return $(window);
  }

  // -> Returns created jquery element.
  protected createTitle()
  {
    // Create a DOM element.
    let title = this.createTitleElement
    (
      this.getTitleId(),
      Window.TITLE_CSS_CLASS
    );

    // Create jquery element from the DOM element.
    let $title = $(title);

    // Set the default text to 'title' element.
    $title.text('New window');

    return $title;
  }

  // -> Returns created jquery element.
  protected createTitleBar()
  {
    // Create a DOM element.
    let titleBar = this.createDivElement
    (
      this.getTitleBarId(),
      Window.TITLE_BAR_CSS_CLASS
    );

    // Create a jquery element from the DOM element.
    let $titleBar = $(titleBar);

    // Create jquery element 'title'.
    this.$title = this.createTitle();
    // Put it in the 'titleBar' element.
    $titleBar.append(this.$title);

    return $titleBar;
  }

  // -> Returns created html element.
  protected createContent()
  {
    // Create a DOM element.
    let content = this.createDivElement
    (
      this.getContentId(),
      Window.CONTENT_CSS_CLASS
    );

    // Create a jquery element from the DOM element.
    return $(content);
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

}

///export = Window;