/*
  Part of BrutusNEXT

  Manages an instance of web client application.

  Usage:
    import {Client} from './Client';
    Client.create(); // Creates an instance.
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
///import {Body} from '../../../client/gui/component/Body';
///import {ScrollWindow} from '../../../client/gui/scroll/ScrollWindow';
import {Document} from '../../../client/gui/Document';
import {Connection} from '../../../client/lib/connection/Connection';
import {ClientSocket} from '../../../client/lib/net/ClientSocket';
import {Windows} from '../../../client/gui/window/Windows';

export class ClientApp extends App
{
  // -------------- Static class data -------------------

  // ----------------- Public data ----------------------

  // ---------------- Protected data --------------------

  // ~ Overrides App.entityManager.
  // Contains all entities (accounts, characters, rooms, etc.).
  protected entities = new ClientEntities();

  // ~ Overrides App.prototypeManager.
  // Manages prototype entities.
  protected prototypes = new ClientPrototypes();

  // ----------------- Private data ---------------------

  // --- websocket communication ---

  /// Deprecated
  /*
  // Class handling websocket communication.
  private webSocketClient = new WebSocketClient();
  */

  // There is only one connection per client application
  // (it means one connection per browser tab if you
  //  open the client in multiple tabs).
  private connection = new Connection();

  // --- components ---

  // Html document.
  private document = new Document();

  /*
  // Html <body> element.
  private body = new Body();
  */

  // All windows should be here.
  private windows = new Windows();

  // Client application state
  // (determines which windows are visible).
  private state = ClientApp.State.INITIAL;

  // --------------- Static accessors -------------------

  public static get document()
  {
    return ClientApp.getInstance().document;
  }

  public static get windows()
  {
    return ClientApp.getInstance().windows;
  }

  public static get connection()
  {
    return ClientApp.getInstance().connection;
  }

  // ------------- Public static methods ----------------

  public static setState(state: ClientApp.State)
  {
    if (state === ClientApp.State.INITIAL)
    {
      ERROR("Attempt to set ClientApp.state to 'INITIAL'. This can"
        + " only be done by implicit inicialization");
      return;
    }

    let app = ClientApp.getInstance();

    app.state = state;

    app.windows.onAppStateChange(state);
  }

  // Creates and runs an instance of ClientApp.
  public static async run()
  {
    if (this.instanceExists())
    {
      ERROR("Instance of ClientApp already exists."
        + "ClientApp.run() can only be called once");
      return;
    }

    // Create the singleton instance of ClientApp.
    this.createInstance();

    // Run client application.
    await ClientApp.getInstance().run();
  }

  // ------------ Protected static methods -------------- 

  // Creates an instance of a client. Client is a singleton,
  // so it must not already exist.
  protected static createInstance()
  {
    if (App.instance !== null)
    {
      ERROR("Client already exists, not creating it");
      return;
    }

    App.instance = new ClientApp();
  }

  // -> Returns the ClientApp singleton instance.
  protected static getInstance(): ClientApp
  {
    if (ClientApp.instance === null || ClientApp.instance === undefined)
      FATAL_ERROR("Instance of client doesn't exist yet");

    // We can safely typecast here, because ClientApp.createInstance()
    // assigns an instance of ClientApp to App.instance.
    return <ClientApp>App.instance;
  }

  // ---------------- Public methods --------------------

  /// Deprecated
  /*
  public createConnection()
  {
    let socketDescriptor = this.webSocketClient.createSocketDescriptor();
    let connection = new Connection(socketDescriptor);

    this.connections.add(connection);

    return connection;
  }
  */

  // --------------- Protected methods ------------------

  // ~ Overrides App.reportError().
  // Reports error message and stack trace.
  // (Don't call this method directly, use ERROR()
  //  from /shared/lib/error/ERROR).
  protected reportError(message: string)
  {
    let errorMsg = message + "\n"
      + Syslog.getTrimmedStackTrace(Syslog.TrimType.ERROR);

    // Just log the message to the console for now.
    console.log('ERROR: ' + errorMsg);
  }

  // ~ Overrides App.reportFatalError().
  // Reports error message and stack trace and terminates the program.
  // (Don't call this method directly, use FATAL_ERROR()
  //  from /shared/lib/error/ERROR).
  protected reportFatalError(message: string)
  {
    let errorMsg = message + "\n"
      + Syslog.getTrimmedStackTrace(Syslog.TrimType.ERROR);
      
    // Just log the message to the console for now
    // (terminating the client application is probably not necessary).
    console.log('FATAL_ERROR: ' + errorMsg);
  }

  // ~ Overrides App.syslog().
  protected syslog
  (
    message: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  {
    return ClientSyslog.log(message, msgType, adminLevel);
  }

  // ---------------- Private methods -------------------

  // Starts the client application.
  private async run()
  {
    // Reports the problem to the user if websockets aren't available.
    if (!ClientSocket.checkWebSocketsSupport())
      return;

    this.registerBeforeUnloadHandler();

    // Create an instance of each entity class registered in
    // Classes so they can be used as prototype objects
    // for root prototype entities.
    this.entities.createRootObjects();

    /// TODO: Sloučit do this.windows.createStandaloneWindows().
    this.windows.createStandaloneWindows();

    /// Tohle by se asi mělo vytvářet až po přilogování.
    this.windows.createMapWindow();

    /// Správně by se mělo scrollWindow a Avatar vytvořit po kliknutí
    /// na jméno charu v MenuWindow (nebo možná LoginWindow).
    let scrollWindow = this.windows.createScrollWindow();
    Windows.activeScrollWindow = scrollWindow;
    this.connection.activeAvatar = this.connection.createAvatar(scrollWindow);

    this.connection.connect();

    // Show login window, hide all others.
    ClientApp.setState(ClientApp.State.LOGIN);
    /// TEST:
    //ClientApp.setState(ClientApp.State.CHARSELECT);

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

  private registerBeforeUnloadHandler()
  {
    window.onbeforeunload =
      (event: BeforeUnloadEvent) => { this.onBeforeUnload(event); }
  }

  // ---------------- Event handlers --------------------

  // Executes when html document is fully loaded.
  public static onDocumentReady()
  {
    ClientApp.getInstance().windows.onDocumentReady();
  }

  // Handles 'keydown' event on html document.
  public static onKeyDown(event: JQueryKeyEventObject)
  {
    switch (ClientApp.getInstance().state)
    {
      case ClientApp.State.LOGIN:
      case ClientApp.State.REGISTER:
      case ClientApp.State.TERMS:
      case ClientApp.State.CHARSELECT:
      case ClientApp.State.CHARGEN:
        break;

      case ClientApp.State.IN_GAME:
        Windows.activeScrollWindow.onKeyDown(event);
        break;
    }
  }

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
    this.connection.close(WebSocketEvent.REASON_CLOSE);
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
    IN_GAME
  }
}