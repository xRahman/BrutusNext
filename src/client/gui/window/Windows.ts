/*
  Part of BrutusNEXT

  Windows of the client app.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Document} from '../../../client/gui/Document';
import {Window} from '../../../client/gui/window/Window';
import {LoginWindow} from '../../../client/gui/login/LoginWindow';
import {RegisterWindow} from '../../../client/gui/register/RegisterWindow';
import {TermsWindow} from '../../../client/gui/terms/TermsWindow';
import {CharselectWindow} from
  '../../../client/gui/charselect/CharselectWindow';
import {ChargenWindow} from '../../../client/gui/chargen/ChargenWindow';
import {ScrollWindow} from '../../../client/gui/scroll/ScrollWindow';
import {StandaloneWindow} from '../../../client/gui/window/StandaloneWindow';
import {MapWindow} from '../../../client/gui/map/MapWindow';
import {ClientApp} from '../../../client/lib/app/ClientApp';

export class Windows
{
  // ----------------- Private data ---------------------

  // All created windows (hidden or not).
  private windows = new Set<Window>();

  private loginWindow: (LoginWindow | null) = null;
  private registerWindow: (RegisterWindow | null) = null;
  private termsWindow: (TermsWindow | null) = null;
  private charselectWindow: (CharselectWindow | null) = null;
  private chargenWindow: (ChargenWindow | null) = null;

  // There is just one map window per ClientApp.
  // When avatar is switched, content is redrawn.
  private mapWindow: MapWindow = null;

  /// To be deleted.
  ///private activeScrollWindow: ScrollWindow = null;

  private activeStandaloneWindow: StandaloneWindow = null;

  // --------------- Static accessors -------------------

  public static get loginWindow()
  {
    return ClientApp.windows.loginWindow;
  }

  public static get registerWindow()
  {
    return ClientApp.windows.registerWindow;
  }

  public static get chargenWindow()
  {
    return ClientApp.windows.chargenWindow;
  }

  public static get charselectWindow()
  {
    return ClientApp.windows.charselectWindow;
  }

  public static get mapWindow()
  {
    return ClientApp.windows.mapWindow;
  }

  public static get activeScrollWindow()
  {
    return ClientApp.connection.activeAvatar.scrollWindow;
  }

  /// To be deleted.
  // public static set activeScrollWindow(window: ScrollWindow)
  // {
  //   ClientApp.windows.activeScrollWindow = window;
  // }

  public static get activeStandaloneWindow()
  {
    return ClientApp.windows.activeStandaloneWindow;
  }

  public static set activeStandaloneWindow(window: StandaloneWindow)
  {
    ClientApp.windows.activeStandaloneWindow = window;
  }

  // ---------------- Static methods --------------------

  // Executes when html document is resized.
  public static onDocumentResize()
  {
    for (let window of ClientApp.windows.windows)
      window.onDocumentResize();
  }

  // Runs when html document is fully loaded.
  public static onDocumentReady()
  {
    for (let window of ClientApp.windows.windows)
      window.onDocumentReady();
  }

  public static createScrollWindow()
  {
    return ClientApp.windows.add(new ScrollWindow());
  }

  // ---------------- Public methods --------------------

  // Hides windows that should be hiden in given 'state' and
  // shows those that should be visible.
  public onAppStateChange(state: ClientApp.State)
  {
    // First reset our reference to active standalone window.
    //   If another standalone window will be shown, the reference
    // will be set in it's showByState() method.
    this.activeStandaloneWindow = null;

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

  // Creates a 'Map' window and adds it to app_body.
  public createMapWindow()
  {
    if (this.alreadyExists(this.mapWindow, 'Map'))
      return;

    this.mapWindow = this.add(new MapWindow());

    return this.mapWindow;
  }

  // ---------------- Private methods -------------------

  private createLoginWindow()
  {
    if (this.alreadyExists(this.loginWindow, 'Login'))
      return;

    this.loginWindow = this.add(new LoginWindow());

    return this.loginWindow;
  }

  private createRegisterWindow()
  {
    if (this.alreadyExists(this.registerWindow, 'Register'))
      return;

    this.registerWindow = this.add(new RegisterWindow());

    return this.registerWindow;
  }

  private createTermsWindow()
  {
    if (this.alreadyExists(this.termsWindow, 'Terms'))
      return;

    this.termsWindow = this.add(new TermsWindow());

    return this.termsWindow;
  }

  private createCharlistWindow()
  {
    if (this.alreadyExists(this.charselectWindow, 'Charlist'))
      return;

    this.charselectWindow = this.add(new CharselectWindow());

    return this.charselectWindow;
  }

  private createChargenWindow()
  {
    if (this.alreadyExists(this.chargenWindow, 'Chargen'))
      return;

    this.chargenWindow = this.add(new ChargenWindow());

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

  private add<T extends Window>(window: T)
  {
    this.windows.add(window);

    return window;
  }
}
