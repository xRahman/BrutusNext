/*
  Part of BrutusNEXT

  Stores all Window GUI components
*/

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
  private mapWindow: (MapWindow | null) = null;

  /// To be deleted.
  ///private activeScrollWindow: (ScrollWindow | null) = null;

  private activeStandaloneWindow: (StandaloneWindow | null) = null;

  // --------------- Static accessors -------------------

  // ! Throws an exception on error.
  public static get loginWindow(): LoginWindow
  {
    if (!ClientApp.windows.loginWindow)
      throw new Error("Login window doesn't exist");

    return ClientApp.windows.loginWindow;
  }

  // ! Throws an exception on error.
  public static get registerWindow(): RegisterWindow
  {
    if (!ClientApp.windows.registerWindow)
      throw new Error("Register window doesn't exist");

    return ClientApp.windows.registerWindow;
  }

  // ! Throws an exception on error.
  public static get chargenWindow(): ChargenWindow
  {
    if (!ClientApp.windows.chargenWindow)
      throw new Error("Chargen window doesn't exist");

    return ClientApp.windows.chargenWindow;
  }

  // ! Throws an exception on error.
  public static get charselectWindow(): CharselectWindow
  {
    if (!ClientApp.windows.charselectWindow)
      throw new Error("Charselect window doesn't exist");

    return ClientApp.windows.charselectWindow;
  }

  // ! Throws an exception on error.
  public static get mapWindow(): MapWindow
  {
    if (!ClientApp.windows.mapWindow)
      throw new Error("Map window doesn't exist");

    return ClientApp.windows.mapWindow;
  }

  // ! Throws an exception on error.
  public static get activeScrollWindow()
  {
    if (ClientApp.connection.activeAvatar === null)
      throw new Error("Invalid 'active Avatar'");

    return ClientApp.connection.activeAvatar.scrollWindow;
  }

  /// To be deleted.
  // public static set activeScrollWindow(window: ScrollWindow)
  // {
  //   ClientApp.windows.activeScrollWindow = window;
  // }

  public static get activeStandaloneWindow(): StandaloneWindow | null
  {
    return ClientApp.windows.activeStandaloneWindow;
  }

  public static set activeStandaloneWindow(window: StandaloneWindow | null)
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
  public onAppChangedState(state: ClientApp.State)
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

  private alreadyExists(window: Window | null, wndName: string)
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
