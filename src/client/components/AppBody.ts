/*
  Part of BrutusNEXT

  Implements component 'app_body' (matches html element <body>).
  All other gui components are inserted into it.
*/

'use strict';

import Component = require('../components/Component');
import Window = require('../components/Window');
import ScrollView = require('../components/ScrollView');

import $ = require('jquery');

class AppBody extends Component
{
  public scrollView = new ScrollView();
  private windows: Array<Window> = [];

  /*
  constructor()
  {
    super();
  }
  */

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  protected id = 'appbody';

  // --- Jquery elements ---

  $body = null;
  $scrollView = null;

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
    /// Tohle je docasne - scrollViewu muze byt vic.
    this.scrollView = new ScrollView();
    this.windows.push(this.scrollView);

    // Create jquery element 'scrollview'.
    this.$scrollView = this.scrollView.create();
    // Put it in the 'body' element.
    this.$body.append(this.$scrollView);
  }

  // ---------------- Private methods -------------------


  // ---------------- Event handlers --------------------

}

export = AppBody;