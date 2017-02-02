/*
  Part of BrutusNEXT

  Implements component 'body' (matches html element <body>).
  All other gui components are inserted into it.
*/

'use strict';

///import Component = require('../component/Component');
import {Component} from '../component/Component';
///import Window = require('../component/Window');
import {Window} from '../component/Window';
///import ScrollView = require('../component/ScrollView');
import {ScrollView} from '../component/ScrollView';
///import Map = require('../component/Map');
import {Map} from '../component/Map';
///import Client = require('../Client');
import {Client} from '../Client';
///import Connection = require('../connection/Connection');
import {Connection} from '../connection/Connection';

import $ = require('jquery');
///import * as $ from 'jquery';

export class Body extends Component
{
  ///public scrollView = null;
  private windows: Array<Window> = [];

  constructor(private client: Client)
  {
    super();

    this.$body = $('#' + this.id);

    let connection = client.createConnection();

    this.createScrollView(connection);
    this.createMap(connection);

    /// TEST
    connection.connect();
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

  // Creates a 'Map' window and adds it to app_body.
  public createMap(connection: Connection)
  {
    /// Tohle je docasne - scrollViewu muze byt vic.
    let map = new Map(connection);
    this.windows.push(map);

    // Create jquery element 'scrollview'.
    let $map = map.create();
    // Put it in the 'body' element.
    this.$body.append($map);

    //this.client.mapper = mapper;
  }

  // ---------------- Private methods -------------------


  // ---------------- Event handlers --------------------

}

///export = Body;