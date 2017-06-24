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
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {ClientSyslog} from '../../../client/lib/log/ClientSyslog';
import {App} from '../../../shared/lib/app/App';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ClientEntities} from '../../../client/lib/entity/ClientEntities';
import {ClientPrototypes} from '../../../client/lib/entity/ClientPrototypes';
///import {Body} from '../../../client/gui/component/Body';
///import {ScrollWindow} from '../../../client/gui/scroll/ScrollWindow';
import {Document} from '../../../client/gui/Document';
import {Connection} from '../../../client/lib/net/Connection';
import {ClientSocket} from '../../../client/lib/net/ClientSocket';
import {Windows} from '../../../client/gui/Windows';

export class ClientApp extends App
{
  // -------------- Static class data -------------------

  //------------------ Public data ----------------------

  //----------------- Protected data --------------------

  // ~ Overrides App.entityManager.
  // Contains all entities (accounts, characters, rooms, etc.).
  protected entities = new ClientEntities();

  // ~ Overrides App.prototypeManager.
  // Manages prototype entities.
  protected prototypes = new ClientPrototypes();

  //------------------ Private data ---------------------

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

  // Executes when html document is fully loaded.
  public static onDocumentReady()
  {
    ClientApp.getInstance().windows.onDocumentReady();
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
    // Just log the message to the console for now.
    console.log('ERROR: ' + message);
  }

  // ~ Overrides App.reportFatalError().
  // Reports error message and stack trace and terminates the program.
  // (Don't call this method directly, use FATAL_ERROR()
  //  from /shared/lib/error/ERROR).
  protected reportFatalError(message: string)
  {
    // Just log the message to the console for now
    // (terminating the client application is probably not necessary).
    console.log('FATAL_ERROR: ' + message);
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
    ///ClientApp.setState(ClientApp.State.CHARLIST);

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
    CHARLIST,
    CHARGEN,
    IN_GAME
  }
}