/*
  Part of BrutusNEXT

  Implements component 'app_body' (matches html element <body>).
  All other gui components are inserted into it.
*/

'use strict';

import Element = require('../components/Element');
import Window = require('../components/Window');
import ScrollView = require('../components/ScrollView');

import $ = require('jquery');

class AppBody extends Element
{
  public static get ID() { return 'app_body' };

  private windows: Array<Window> = [];

  constructor()
  {
    super();

    this.id = AppBody.ID;
  }

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

  // Creates a 'ScrollView' window and adds it to app_body.
  public createScrollView()
  {
    let scrollView = new ScrollView();

    this.windows.push(scrollView);

    this.appendHtmlElement(scrollView.createHtmlElement());

  }

  // ---------------- Private methods -------------------


  // ---------------- Event handlers --------------------

}

export = AppBody;