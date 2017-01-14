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
  public scrollView: ScrollView
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

    /// Tohle je docasne - scrollViewu muze byt vic.
    this.scrollView = scrollView;

    this.windows.push(scrollView);
    this.appendElement(scrollView.createElement());

    /*
    /// TEST
    let message = '';
    for (let i = 0; i < 100; i++)
      message += 'line ' + i + '<br>';
    scrollView.appendMessage(message);
    /// /TEST
    */
  }

  // ---------------- Private methods -------------------


  // ---------------- Event handlers --------------------

}

export = AppBody;