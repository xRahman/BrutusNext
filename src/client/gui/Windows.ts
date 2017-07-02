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
import {TermsWindow} from '../../client/gui/terms/TermsWindow';
import {CharlistWindow} from '../../client/gui/charlist/CharlistWindow';
import {ChargenWindow} from '../../client/gui/chargen/ChargenWindow';
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
  private termsWindow: TermsWindow = null;
  private charlistWindow: CharlistWindow = null;
  private chargenWindow: ChargenWindow = null;

  // There is just one map window per ClientApp.
  // When avatar is switched, content is redrawn.
  private mapWindow: MapWindow = null;

  private activeScrollWindow: ScrollWindow = null;

  // --------------- Static accessors -------------------

  public static get registerWindow()
  {
    return ClientApp.windows.registerWindow;
  }

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

  public createStandaloneWindows()
  {
    this.createLoginWindow();
    this.createRegisterWindow();
    this.createTermsWindow();
    this.createCharlistWindow();
    this.createChargenWindow();
  }

  // Creates a 'ScrollWindow' and adds it to app_body.
  public createScrollWindow()
  {
    return this.createAndAdd(new ScrollWindow());
  }

  // Creates a 'Map' window and adds it to app_body.
  public createMapWindow()
  {
    if (this.alreadyExists(this.mapWindow, 'Map'))
      return;

    this.mapWindow = this.createAndAdd(new MapWindow());

    return this.mapWindow;
  }

  // Executes when html document is fully loaded.
  public onDocumentReady()
  {
    for (let window of this.windows)
      window.onDocumentReady();
  }

  // ---------------- Private methods -------------------

  private createLoginWindow()
  {
    if (this.alreadyExists(this.loginWindow, 'Login'))
      return;

    this.loginWindow = this.createAndAdd(new LoginWindow());

    return this.loginWindow;
  }

  private createRegisterWindow()
  {
    if (this.alreadyExists(this.registerWindow, 'Register'))
      return;

    this.registerWindow = this.createAndAdd(new RegisterWindow());

    return this.registerWindow;
  }

  private createTermsWindow()
  {
    if (this.alreadyExists(this.termsWindow, 'Terms'))
      return;

    this.termsWindow = this.createAndAdd(new TermsWindow());

    return this.termsWindow;
  }

  private createCharlistWindow()
  {
    if (this.alreadyExists(this.charlistWindow, 'Charlist'))
      return;

    this.charlistWindow = this.createAndAdd(new CharlistWindow());

    return this.charlistWindow;
  }

  private createChargenWindow()
  {
    if (this.alreadyExists(this.chargenWindow, 'Chargen'))
      return;

    this.chargenWindow = this.createAndAdd(new ChargenWindow());

    return this.chargenWindow;
  }

  private alreadyExists(window: Window, wndName: string)
  {
    if (window !== null)
    {
      ERROR(wndName + " window already exists. There can only be one"
        + " such window per client application");
      return window;
    }
  }

  private createAndAdd<T extends Window>(window: T)
  {
    window.create();
    this.windows.add(window);

    return window;
  }

  // ---------------- Event handlers --------------------

}
