/*
  Part of BrutusNEXT

  Implements component 'body' (matches html element <body>).
  All other gui components are inserted into it.
*/

'use strict';

import {Component} from '../component/Component';
import {Window} from '../component/Window';
import {ScrollView} from '../component/ScrollView';
import {MapWindow} from '../component/MapWindow';
import {Client} from '../Client';
import {Connection} from '../connection/Connection';

import $ = require('jquery');

export class Body extends Component
{
  private windows: Array<Window> = [];

  constructor(private client: Client)
  {
    super();

    this.$body = $('#' + this.id);

    let connection = client.createConnection();

    this.createScrollView(connection);
    this.createMapWindow(connection);

    /// TEST
    connection.connect();
  }

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  protected id = 'body';

  // --- Jquery elements ---

  $body = null;

  //------------------ Private data ---------------------

  // 'id' parameter of html element.
  ///private id = '#scroll-view';

  // --------------- Static accessors -------------------

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

  // Creates a 'Map' window and adds it to app_body.
  public createMapWindow(connection: Connection)
  {
    let mapWindow = new MapWindow(connection);
    this.windows.push(mapWindow);

    // Create jquery element 'scrollview'.
    let $map = mapWindow.create();
    // Put it in the 'body' element.
    this.$body.append($map);

    //this.client.mapper = mapper;
  }

  // Executes when html document is fully loaded.
  public onDocumentReady()
  {
    for (let window of this.windows)
      window.onDocumentReady();
  }

  // Executes when html document is resized.
  public onDocumentResize()
  {
    for (let window of this.windows)
      window.onDocumentResize();
  }

  // ---------------- Private methods -------------------


  // ---------------- Event handlers --------------------

}
