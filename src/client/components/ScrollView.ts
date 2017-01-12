/*
  Part of BrutusNEXT

  Implements scrollable text window.
*/

'use strict';

import Window = require('../components/Window');

import $ = require('jquery');

class ScrollView extends Window
{

  constructor()
  {
    super();

    /*
    let css =
    {
			width: $(window).width() - 100,
			height: $(window).width() - 100,
			top: 100,
			left: 100
		}

    let properties =
    {
      id: this.id,
      css: css,
      class: 'scroll-view nofade',
      master: null,
      closeable: true
    }

    /// Aha, tohle neni primo html element, Plamzi ma vlastni classu
    /// Window...
    this.window = new Window(properties);
    */
  }

  // -------------- Static class data -------------------


  //------------------ Private data ---------------------

  // 'id' parameter of html element.
  private id = '#scroll-view';

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


  // ---------------- Event handlers --------------------

}

export = ScrollView;