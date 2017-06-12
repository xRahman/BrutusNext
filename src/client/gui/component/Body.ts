/*
  Part of BrutusNEXT

  Implements component 'body' (matches html element <body>).
  All other gui components are inserted into it.
*/

'use strict';

import {Component} from '../../../client/gui/component/Component';
import {Window} from '../../../client/gui/component/Window';
import {ScrollWindow} from '../../../client/gui/component/ScrollWindow';
import {MapWindow} from '../../../client/gui/component/MapWindow';
import {ClientApp} from '../../../client/lib/app/ClientApp';

import $ = require('jquery');

export class Body extends Component
{
  private windows: Array<Window> = [];

  constructor(private client: ClientApp)
  {
    super();

    this.$body = $('#' + this.id);

    this.createScrollWindow();
    this.createMapWindow();
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

  // Creates a 'ScrollWindow' and adds it to app_body.
  public createScrollWindow()
  {
    /// Tohle je docasne - scrollWindowu muze byt vic.
    let scrollWindow = new ScrollWindow();
    this.windows.push(scrollWindow);

    // Create jquery element 'scrollwindow'.
    let $scrollWindow = scrollWindow.create();
    // Put it in the 'body' element.
    this.$body.append($scrollWindow);

    this.client.activeScrollWindow = scrollWindow;
  }

  // Creates a 'Map' window and adds it to app_body.
  public createMapWindow()
  {
    let mapWindow = new MapWindow();
    this.windows.push(mapWindow);

    // Create jquery element 'mapwindow'.
    let $mapWindow = mapWindow.create();
    // Put it in the 'body' element.
    this.$body.append($mapWindow);

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
