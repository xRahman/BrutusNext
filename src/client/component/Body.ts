/*
  Part of BrutusNEXT

  Implements component 'body' (matches html element <body>).
  All other gui components are inserted into it.
*/

'use strict';

import Component = require('../component/Component');
import Window = require('../component/Window');
import ScrollView = require('../component/ScrollView');
import Client = require('../Client');
import Connection = require('../connection/Connection');

import $ = require('jquery');

class Body extends Component
{
  ///public scrollView = null;
  private windows: Array<Window> = [];

  constructor(private client: Client)
  {
    super();

    this.$body = $('#' + this.id);

    let connection = client.createConnection();

    /// TEST
    connection.connect();

    this.createScrollView(connection);
  }

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  protected id = 'body';

  // --- Jquery elements ---

  $body = null;
  ///$scrollView = null;

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
  public createScrollView(connection: Connection)
  {
    /// Tohle je docasne - scrollViewu muze byt vic.
    let scrollView = new ScrollView(connection);
    this.windows.push(scrollView);

    // Create jquery element 'scrollview'.
    let $scrollView = scrollView.create();
    // Put it in the 'body' element.
    this.$body.append($scrollView);

    this.client.activeScrollView = scrollView;
  }

  // ---------------- Private methods -------------------


  // ---------------- Event handlers --------------------

}

export = Body;