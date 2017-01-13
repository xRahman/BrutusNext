/*
  Part of BrutusNEXT

  Implements draggble and resizable window within the browser viewport.
*/

'use strict';

import AppBody = require('../components/AppBody');
import Element = require('../components/Element');

import $ = require('jquery');

class Window extends Element
{
  public static get CSS_CLASS() { return 'Window'; }

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

  // ---------------- Public methods --------------------

  // Creates respective html element in the document
  // (does not insert it in it's container element).
  // -> Returns newly created html element.
  public createHtmlElement()
  {
    let scrollViewElement = document.createElement("div");

    scrollViewElement.id = this.id;
    scrollViewElement.className = Window.CSS_CLASS;

    /// budou chtit mit scrollbar.
    // Add css style properties that determine functionality of the
    // element (css properties only affecting visual should be placed
    // in respective css stylesheet).

    /// Tohle by mozna melo byt az ve scrollview - nektera okna mozna
    // 'overflow: hidden' means that overflowing content will be clipped
    // (without scrollbar).
    scrollViewElement.style.overflow = 'hidden';

    return scrollViewElement;

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


  // ---------------- Event handlers --------------------

}

export = Window;