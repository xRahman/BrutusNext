/*
  Part of BrutusNEXT

  Implements web client.

  Client is a singleton, you can access the instance by Client.getInstance()

  Usage:
    import {Client} from './Client';
    Client.create(); // Creates an instance.
*/

'use strict';

import {ERROR} from '../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../shared/lib/error/FATAL_ERROR';
import {App} from '../../shared/lib/App';
import {Body} from '../../client/gui/component/Body';
import {Document} from '../../client/gui/component/Document';
import {Connection} from '../../client/lib/connection/Connection';
import {WebSocketClient} from '../../client/lib/net/ws/WebSocketClient';

export class Client extends App
{
  // -------------- Static class data -------------------

  protected static instance: Client = null;

  //------------------ Public data ----------------------

  public activeScrollWindow = null;

  //------------------ Private data ---------------------

  // --- websocket communication ---

  // Class handling websocket communication.
  private webSocketClient = new WebSocketClient();

  private connections = new Set<Connection>();

  // --- components ---

  // Html document.
  private document = new Document(this);

  // Html <body> element.
  private body = new Body(this);

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  /*
  public static instanceExists()
  {
    return Client.instance !== null && Client.instance !== undefined;
  }
  */

  public static getInstance(): Client
  {
    if (Client.instance === null || Client.instance === undefined)
      FATAL_ERROR("Instance of client doesn't exist yet");

    return <Client>App.instance;
  }

  // Creates an instance of a client. Client is a singleton, so it must
  // not already exist.
  public static create()
  {
    // Reports the problem to the user if websockets aren't available.
    if (!WebSocketClient.webSocketsAvailable())
      return;

    if (Client.instance !== null)
    {
      ERROR("Client already exists, not creating it");
      return;
    }

    Client.instance = new Client();
  }

  // ---------------- Public methods --------------------

  // Reports error message and stack trace.
  // (Don't call this method directly, use ERROR()
  //  from /shared/lib/error/ERROR).
  public reportError(message: string)
  {
    // Just log the message to the console for now.
    console.log('ERROR: ' + message);
  }

  // Reports error message and stack trace and terminates the program.
  // (Don't call this method directly, use FATAL_ERROR()
  //  from /shared/lib/error/ERROR).
  public reportFatalError(message: string)
  {
    // Just log the message to the console for now
    // (terminating the client application is probably not necessary).
    console.log('FATAL_ERROR: ' + message);
  }

  public createConnection()
  {
    let socketDescriptor =  this.webSocketClient.createSocketDescriptor();
    let connection = new Connection(socketDescriptor);

    this.connections.add(connection);

    return connection;
  }

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

  // ---------------- Event handlers --------------------

  // ---------------- Private methods -------------------

}