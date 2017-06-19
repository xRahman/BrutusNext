/*
  Part of BrutusNEXT

  Windows of the client app.
*/

'use strict';

import {ERROR} from '../../shared/lib/error/ERROR';
import {Document} from '../../client/gui/Document';
import {Window} from '../../client/gui/Window';
import {LoginWindow} from '../../client/gui/login/LoginWindow';
import {RegisterWindow} from '../../client/gui/register/RegisterWindow';
import {ScrollWindow} from '../../client/gui/scroll/ScrollWindow';
import {MapWindow} from '../../client/gui/map/MapWindow';
import {ClientApp} from '../../client/lib/app/ClientApp';

import $ = require('jquery');

export class Windows
{
  //----------------- Protected data --------------------

  //------------------ Private data ---------------------

  // All created windows (hidden or not).
  private windows = new Set<Window>();

  private loginWindow: LoginWindow = null;
  private registerWindow: RegisterWindow = null;

  // There is just one map window per ClientApp.
  // When avatar is switched, content is redrawn.
  private mapWindow: MapWindow = null;

  private activeScrollWindow: ScrollWindow = null;

  // --------------- Static accessors -------------------

  public static get mapWindow()
  {
    return ClientApp.windows.mapWindow;
  }

  public static get activeScrollWindow()
  {
    return ClientApp.windows.activeScrollWindow;
  }

  public static set activeScrollWindow(window: ScrollWindow)
  {
    ClientApp.windows.activeScrollWindow = window;
  }

  // ---------------- Static methods --------------------

  // Executes when html document is resized.
  public static onDocumentResize()
  {
    for (let window of ClientApp.windows.windows)
      window.onDocumentResize();
  }

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  // Hides windows that should be hiden in given 'state' and
  // shows those that should be visible.
  public onAppStateChange(state: ClientApp.State)
  {
    for (let window of this.windows)
      window.showByState(state);
  }

  public createLoginWindow()
  {
    if (this.loginWindow !== null)
    {
      ERROR("Login window already exists. There can only be one"
        + " login window per client application");
      return;
    }

    this.loginWindow = new LoginWindow();
    this.loginWindow.create();
    this.windows.add(this.loginWindow);
    

    return this.loginWindow;
  }

  public createRegisterWindow()
  {
    if (this.registerWindow !== null)
    {
      ERROR("Register window already exists. There can only be one"
        + " register window per client application");
      return;
    }

    this.registerWindow = new RegisterWindow();
    this.registerWindow.create();
    this.windows.add(this.registerWindow);

    return this.registerWindow;
  }

  // Creates a 'ScrollWindow' and adds it to app_body.
  public createScrollWindow()
  {
    let scrollWindow = new ScrollWindow();

    scrollWindow.create();
    this.windows.add(scrollWindow);

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
    this.mapWindow.create();
    this.windows.add(this.mapWindow);

    return this.mapWindow;
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
