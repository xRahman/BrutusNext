/*
  Part of BrutusNEXT

  Manages an instance of web client application.

  Usage:
    import {ClientApp} from '../client/lib/app/ClientApp';
    const CLIENT_APP_VERSION = "0.0";
    ClientApp.run(CLIENT_APP_VERSION);
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {ClientSyslog} from '../../../client/lib/log/ClientSyslog';
import {WebSocketEvent} from '../../../shared/lib/net/WebSocketEvent';
import {App} from '../../../shared/lib/app/App';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ClientEntities} from '../../../client/lib/entity/ClientEntities';
import {ClientPrototypes} from '../../../client/lib/entity/ClientPrototypes';
import {Document} from '../../../client/gui/Document';
import {Connection} from '../../../client/lib/connection/Connection';
import {ClientSocket} from '../../../client/lib/net/ClientSocket';
import {Windows} from '../../../client/gui/window/Windows';

export class ClientApp extends App
{
  // -------------- Static constants --------------------

  public static readonly APP_ERROR = "Application Error";

  // --------------- Static accessors -------------------

  public static get document() { return this.instance.document; }
  public static get windows() { return this.instance.windows; }
  public static get connection() { return this.instance.connection; }
  public static get state() { return this.instance.state; }

  // -------------- Static class data -------------------

  // ~ Overrides App.instance.
  protected static instance = new ClientApp();

  // ---------------- Protected data --------------------

  // ~ Overrides App.entities.
  // Contains all entities (accounts, characters, rooms, etc.).
  protected entities = new ClientEntities();

  // ~ Overrides App.prototypes.
  protected prototypes = new ClientPrototypes();

  // ----------------- Private data ---------------------

  // There is only one connection per client application
  // (it means one connection per browser tab if you
  //  open the client in multiple tabs).
  private connection = new Connection();

  // Html document.
  private document = new Document();

  private windows = new Windows();

  // Application state determines which windows are visible.
  private state = ClientApp.State.INITIAL;

  // ------------- Public static methods ----------------

  public static switchToState(state: ClientApp.State)
  {
    if (state === ClientApp.State.INITIAL)
    {
      ERROR("Attempt to set ClientApp.state to 'INITIAL'. This can"
        + " only be done by implicit inicialization");
      return;
    }

    this.instance.state = state;

    this.windows.onAppChangedState(state);

    if (state === ClientApp.State.ERROR)
      alert("An error occured. Please reload the browser tab to log back in.");
  }

  // Creates and runs an instance of ClientApp.
  public static async run(version: string)
  {
    let clientApp = this.instance;

    if (clientApp.isAlreadyRunning())
      return;

    // Log our name and version.
    Syslog.log
    (
      "BrutusNext client v. " + version,
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    if (!ClientSocket.checkWebSocketSupport())
      return;

    clientApp.initClasses();
    clientApp.initGUI();

    clientApp.connection.connect();

    clientApp.showLoginWindow();
    
    /// TEST:
    //ClientApp.setState(ClientApp.State.IN_GAME);

    /// TODO: Stáhnout viewport data ze serveru.
    /// I když možná nestačí connection.connect(), ještě se asi bude
    /// muset player přilogovat - aby se dalo vůbec zjistit, kde je
    /// (a tedy co se má stáhnout a renderovat).
    /// TODO: Vyrenderovat je do mapy.

    /// Možná bych se prozatím mohl vykašlat na zjišťování pozice avataru
    /// a prostě stáhnout nějaký fixní výřez (ono v něm stejně nic nebude).

    /// Jinak asi fakt budu muset udělat logovací komponenty, protože
    /// z telnet-style loginu v clientu nepoznám, že se hráč nalogoval do hry.
  }

  // --------------- Protected methods ------------------

  // ~ Overrides App.reportException().
  protected reportException(error: Error): void
  {
    this.report(error);
  }

  // ~ Overrides App.reportError().
  protected reportError(message: string): void
  {
    this.report(new Error(message));
  }

  // ~ Overrides App.reportFatalError().
  protected reportFatalError(message: string): void
  {
    // There is no point in 'crashing' client app, it's just
    // a web page.
    this.report(new Error(message));
  }

  // ~ Overrides App.log().
  protected log
  (
    message: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  : void
  {
    ClientSyslog.log(message, msgType, adminLevel);
  }

  // ---------------- Private methods -------------------

  protected report(error: Error): void
  {
    // Throw an error instead of reporting to the console
    // because this way Chrome prints out stack trace using
    // source maps (so in .ts files) rathen than in .js files
    // (which is not so useful).
    throw error;
  }

  private registerBeforeUnloadHandler()
  {
    window.onbeforeunload =
      (event: BeforeUnloadEvent) => { this.onBeforeUnload(event); }
  }

  private initGUI()
  {
    this.registerBeforeUnloadHandler();

    this.windows.createStandaloneWindows();

    /// Tohle by se asi mělo vytvářet až po přilogování.
    /// - nakonec ne. Bude jen jedno map window na clientApp,
    ///   jeho obsah se bude překreslovat podle aktivního charu.
    this.windows.createMapWindow();
  }

  private showLoginWindow()
  {
    ClientApp.switchToState(ClientApp.State.LOGIN);
  }

  // ---------------- Event handlers --------------------

  private onBeforeUnload(event: BeforeUnloadEvent)
  {
    this.connection.reportClosingBrowserTab();

    // Close the connection to prevent browser from closing it
    // abnormally with event code 1006.
    //   For some strange reson this doesn't alway work in Chrome.
    // If we call socket.close(1000, "Tab closed"), onClose() event
    // handler on respective server socket will receive the reason
    // but sometimes code will be 1006 instead of 1000. To circumvent
    // this, we send WebSocketEvent.REASON_CLOSE when socket is closed
    // from onBeforeUnload() and we check for it in ServerSocket.onClose().
    this.connection.close(WebSocketEvent.TAB_CLOSED);
  }
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module ClientApp
{
  export enum State
  {
    INITIAL,
    LOGIN,
    REGISTER,
    TERMS,
    CHARSELECT,
    CHARGEN,
    IN_GAME,
    ERROR   // Player is asked to reload browser tab to recover.
  }
}