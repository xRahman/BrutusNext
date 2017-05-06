/*
  Part of BrutusNEXT

  Manages an instance of web client application.

  Usage:
    import {Client} from './Client';
    Client.create(); // Creates an instance.
*/

'use strict';

import {ERROR} from '../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../shared/lib/error/FATAL_ERROR';
import {AdminLevel} from '../../shared/lib/admin/AdminLevel';
import {MessageType} from '../../shared/lib/message/MessageType';
///import {Saveable} from '../../shared/lib/class/Saveable';
import {ClientSyslog} from '../../client/lib/log/ClientSyslog';
import {App} from '../../shared/lib/App';
import {Entity} from '../../shared/lib/entity/Entity';
import {ClientEntityManager} from
  '../../client/lib/entity/ClientEntityManager';
import {Body} from '../../client/gui/component/Body';
import {Document} from '../../client/gui/component/Document';
import {Connection} from '../../client/lib/connection/Connection';
import {WebSocketClient} from '../../client/lib/net/ws/WebSocketClient';

export class ClientApp extends App
{
  // -------------- Static class data -------------------

  protected static instance: ClientApp = null;

  //------------------ Public data ----------------------

  public activeScrollWindow = null;

  //----------------- Protected data --------------------

  protected entityManager = new ClientEntityManager();

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

  // Overrides App.createInstance().
  // Creates an instance of a client. Client is a singleton, so it must
  // not already exist.
  protected static createInstance()
  {
    // Reports the problem to the user if websockets aren't available.
    if (!WebSocketClient.webSocketsAvailable())
      return;

    if (App.instance !== null)
    {
      ERROR("Client already exists, not creating it");
      return;
    }

    App.instance = new ClientApp();
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

  // --------------- Protected methods ------------------

  protected syslog
  (
    text: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  {
    return ClientSyslog.log(text, msgType, adminLevel);
  }

  protected saveEntity(entity: Entity)
  {
    // (it is possible that HTML5 Local Storage will be
    //  used in the future, however).
    ERROR("Client doesn't have a save/load capability yet");
  }

  protected loadEntity(entity: Entity)
  {
    // (it is possible that HTML5 Local Storage will be
    //  used in the future, however).
    ERROR("Client doesn't have a save/load capability yet");
  }

  // ---------------- Private methods -------------------

}