/*
  Part of BrutusNEXT

  Implements component 'body' (matches html element <body>).
  All other gui components are inserted into it.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Component} from '../../../client/gui/component/Component';
import {Window} from '../../../client/gui/component/Window';
import {LoginWindow} from '../../../client/gui/component/LoginWindow';
import {ScrollWindow} from '../../../client/gui/component/ScrollWindow';
import {MapWindow} from '../../../client/gui/component/MapWindow';
import {ClientApp} from '../../../client/lib/app/ClientApp';

import $ = require('jquery');

export class Body extends Component
{
  constructor()
  {
    super();

    ///this.$body = $('#' + this.id);

    /*
    /// Todo: Asi to spíš nedělat tady, ale až v nějakém initu,
    /// ať rozumně fungují errory.
    this.createScrollWindow();
    this.createMapWindow();
    */
  }

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  protected id = 'body';

  // --- Jquery elements ---

  protected $body = $('#' + this.id);

  //------------------ Private data ---------------------

  // 'id' parameter of html element.
  ///private id = '#scroll-view';

  // All windows should be here.
  private windows = new Set<Window>();

  private loginWindow: LoginWindow = null;

  // There is just one map window per ClientApp.
  // When avatar is switched, content is redrawn.
  private mapWindow: MapWindow = null;

  private activeScrollWindow: ScrollWindow = null;

  // --------------- Static accessors -------------------

  public static get mapWindow()
  {
    return ClientApp.body.mapWindow;
  }

  public static get activeScrollWindow()
  {
    return ClientApp.body.activeScrollWindow;
  }

  public static set activeScrollWindow(window: ScrollWindow)
  {
    ClientApp.body.activeScrollWindow = window;
  }

  // ---------------- Static methods --------------------

  // Executes when html document is resized.
  public static onDocumentResize()
  {
    for (let window of ClientApp.body.windows)
      window.onDocumentResize();
  }

  // ---------------- Public methods --------------------

  public createLoginWindow()
  {
    if (this.loginWindow !== null)
    {
      ERROR("Login window already exists. There can only be one"
        + " login window per client application");
      return;
    }

    this.loginWindow = new LoginWindow();
    this.windows.add(this.loginWindow);

    // Create jquery element 'loginwindow'.
    let $loginWindow = this.loginWindow.create();
    // Put it in the 'body' element.
    this.$body.append($loginWindow);

    return this.loginWindow;
  }

  // Creates a 'ScrollWindow' and adds it to app_body.
  public createScrollWindow()
  {
    let scrollWindow = new ScrollWindow();

    this.windows.add(scrollWindow);

    // Create jquery element 'scrollwindow'.
    let $scrollWindow = scrollWindow.create();
    // Put it in the 'body' element.
    this.$body.append($scrollWindow);

    return scrollWindow;
  }

  // Creates a 'Map' window and adds it to app_body.
  public createMapWindow()
  {
    if (this.mapWindow !== null)
    {
      ERROR("Map window already exists. There can only be one"
        + " map window per client application");
      return;
    }

    this.mapWindow = new MapWindow();
    this.windows.add(this.mapWindow);

    // Create jquery element 'mapwindow'.
    let $mapWindow = this.mapWindow.create();
    // Put it in the 'body' element.
    this.$body.append($mapWindow);
  }

  // Executes when html document is fully loaded.
  public onDocumentReady()
  {
    for (let window of this.windows)
      window.onDocumentReady();
  }

  // ---------------- Private methods -------------------


  // ---------------- Event handlers --------------------

}
