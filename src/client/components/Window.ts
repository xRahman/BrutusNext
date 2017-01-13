/*
  Part of BrutusNEXT

  Implements draggble and resizable window within the browser viewport.
*/

'use strict';

import AppBody = require('../components/AppBody');
import Component = require('../components/Component');

import $ = require('jquery');

class Window extends Component
{
  public static get CSS_CLASS() { return 'Window'; }
  public static get TITLE_BAR_CSS_CLASS() { return 'WindowTitleBar'; }
  public static get CONTENT_CSS_CLASS() { return 'WindowContent'; }

  constructor()
  {
    super();
  }

  // -------------- Static class data -------------------


  //------------------ Private data ---------------------

  // 'id' parameter of html element.
  ///private id = '#scroll-view';

  // --------------- Static accessors -------------------

  // These are shortcuts so you don't have to use Client.getInstance()

  /// Example
  /*
  public static get game()
  {
    return Server.getInstance().game;
  }
  */
  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  public getTitleBarId()
  {
    return this.getId() + '__title_bar';
  }

  public getContentId()
  {
    return this.getId() + '__content';
  }

  // ---------------- Public methods --------------------

  // Creates respective html element in the document
  // (does not insert it in it's container element).
  // -> Returns newly created html element.
  public createElement()
  {
    let window = document.createElement('div');

    window.id = this.getId();
    window.className = Window.CSS_CLASS;

    /// budou chtit mit scrollbar.
    // Add css style properties that determine functionality of the
    // element (css properties only affecting visual should be placed
    // in respective css stylesheet).

    /// Tohle by mozna melo byt az ve scrollview - nektera okna mozna
    // 'overflow: hidden' means that overflowing content will be clipped
    // (without scrollbar).
    window.style.overflow = 'hidden';

    // Create html element 'title_bar'.
    let titleBar = this.createTitleBarElement();
    // Put it in the 'window' element.
    window.appendChild(titleBar);

    // Create html element 'content'.
    let content = this.createContentElement();
    // Put it in the 'window' element.
    window.appendChild(content);


    return window;

    /*
    $('#' + AppBody.ID)
    		j('.app').prepend('\
			<div id="'+ id.split('#')[1] +'" class="window '+ ( o['class'] || '' ) + '" >\
				<div class="content"></div>\
			</div>\
		');
    */
  }

  // --------------- Protected methods ------------------


  // ---------------- Private methods -------------------

  // -> Returns create html element.
  private createTitleBarElement()
  {
    let titleBar = document.createElement('div');

    titleBar.id = this.getTitleBarId();
    titleBar.className = Window.TITLE_BAR_CSS_CLASS;

    return titleBar;
  }

  // -> Returns create html element.
  private createContentElement()
  {
    let content = document.createElement('div');

    content.id = this.getContentId();
    content.className = Window.CONTENT_CSS_CLASS;

    return content;
  }


  // ---------------- Event handlers --------------------

}

export = Window;