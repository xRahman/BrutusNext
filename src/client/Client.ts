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
import WebSocketDescriptor = require('./net/WebSocketDescriptor');
import AppBody = require('./components/AppBody');

import $ = require('jquery');

class Client
{
  constructor()
  {
    // Register event handler 'onDocumentReady'.
    $(document).ready
    (
      // Use lambda function to correctly initialize
      // 'this' for 'onDocumentReady()' function.
      () => { this.onDocumentReady(); }
    );

    this.appBody.createScrollView();
  }

  // -------------- Static class data -------------------

  protected static instance: Client = null;

  //------------------ Public data ---------------------- 
  
  /// TODO: Socket descriptoru muze byt vic (imm muze chtit lognout
  /// vic charu). Tezko rict, kde by mely byt - primo ve scrollView
  /// asi ne, protoze connection ovlivnuje vic elementu nez jen
  /// scrollview.
  /// (scrollview by si kazdopadne melo drzet descriptor, do ktereho
  ///  zapisuje)
  public webSocketDescriptor = new WebSocketDescriptor();

  //------------------ Private data ---------------------


  // --- singleton instances ---
  // (There is only one such instance per client.)

  // Container for all other gui components (matches html element <body>).
  private appBody = new AppBody();

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
    if (!Client.webSocketsAvailable())
      return;

    if (Client.instance !== null)
    {
      ERROR("Client already exists, not creating it");
      return;
    }

    Client.instance = new Client();
  }

  // ---------------- Public methods --------------------


  // ---------------- Event handlers --------------------

  // Handles 'document.ready' event.
  // (This event is fired when our web page is completely loaded.)
  private onDocumentReady()
  {
    console.log('onDocumentReady() launched');

    /// TODO: Tohle by se melo predavat nejak elegantneji.
    this.appBody.scrollView.webSocketDescriptor = this.webSocketDescriptor;

    this.webSocketDescriptor.connect();

    /// Tohle asi neni potreba, protoze na zacatku ve scrollView nic neni.
    //this.appBody.scrollView.scrollToBottom();


    /// TEST:
    $(document).keydown
    (
      (event) =>
      {
        let key = event.which;

        console.log('document.keydown ' + key);

        // PgUp(33), PgDn(34), End(35), Home(36),
        // Left(37), Up(38), Right(39), Down(40)
        if(key >= 33 && key <= 40)
        {
          console.log('preventing default action');
          event.preventDefault();
          return false;
        }
        return true;
      }
    );
  }

  // ---------------- Private methods -------------------

  // Checks if browser supports web sockets.
  private static webSocketsAvailable()
  {
    /// Note: MozWebSocket might still be available.
    /// (this code won't compile in typescript though):
    /// WebSocket = WebSocket || MozWebSocket;

    if (WebSocket === undefined)
    {
      alert("Sorry, you browser doesn't support websockets.");
      return false;
    }

    return true;
  }
}

export = Client;