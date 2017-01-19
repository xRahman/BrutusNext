/*
  Part of BrutusNEXT

  Implements web client.

  Client is a singleton, you can access the instance by Client.getInstance()

  Usage:
    import {Client} from './Client';
    Client.create(); // Creates an instance.
*/

'use strict';

import ERROR = require('./error/ERROR');
import Body = require('./component/Body');
import Document = require('./component/Document');
import Connection = require('./connection/Connection');
import WebSocketClient = require('./net/ws/WebSocketClient');

import $ = require('jquery');

class Client
{
  // -------------- Static class data -------------------

  protected static instance: Client = null;

  //------------------ Public data ---------------------- 

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

  public static instanceExists()
  {
    return Client.instance !== null && Client.instance !== undefined;
  }

  public static getInstance()
  {
    if (Client.instance === null || Client.instance === undefined)
      ERROR("Instance of client doesn't exist yet");

    return Client.instance;
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

  public createConnection()
  {
    let socketDescriptor =  this.webSocketClient.createSocketDescriptor();
    let connection = new Connection(socketDescriptor);

    this.connections.add(connection);

    return connection;
  }

  // ---------------- Event handlers --------------------

  // ---------------- Private methods -------------------

}

export = Client;