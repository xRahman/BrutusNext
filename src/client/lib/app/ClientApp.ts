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
///import {Saveable} from '../..../shared/lib/class/Saveable';
import {ClientSyslog} from '../../../client/lib/log/ClientSyslog';
import {App} from '../../../shared/lib/app/App';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ClientEntities} from '../../../client/lib/entity/ClientEntities';
import {ClientPrototypes} from '../../../client/lib/entity/ClientPrototypes';
import {Body} from '../../../client/gui/component/Body';
import {Document} from '../../../client/gui/component/Document';
import {Connection} from '../../../client/lib/connection/Connection';
///import {WebSocketClient} from '../../../client/lib/net/ws/WebSocketClient';
import {WebSocketDescriptor} from
  '../../../client/lib/net/ws/WebSocketDescriptor';

export class ClientApp extends App
{
  // -------------- Static class data -------------------

  //------------------ Public data ----------------------

  public activeScrollWindow = null;

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

  /// Bude jen jedna connection na aplikaci (tj. na záložku v browseru).
  ///private connections = new Set<Connection>();
  private connection = new Connection();

  // --- components ---

  // Html document.
  private document = new Document(this);

  // Html <body> element.
  private body = new Body(this);

  // --------------- Static accessors -------------------

  public static get connection() { return this.connection; }

  // ------------- Public static methods ---------------- 


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

  // Executes when html document is fully loaded.
  public onDocumentReady()
  {
    this.body.onDocumentReady();
  }

  // Executes when html document is resized.
  public onDocumentResize()
  {
    this.body.onDocumentResize();
  }

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
    if (!WebSocketDescriptor.webSocketsAvailable())
      return;

    this.connection.connect();

    /// TODO: Stáhnout viewport data ze serveru.
    /// I když možná nestačí connection.connect(), ještě se asi bude
    /// muset player přilogovat - aby se dalo vůbec zjistit, kde je
    /// (a tedy co se má stáhnout a renderovat).
    /// TODO: Vyrenderovat je do mapy.
  }
}