/*
  Part of BrutusNEXT

  Implements web client.

  Client is a singleton, you can access the instance by Client.getInstance()

  Usage:
    import {Client} from './Client';
    Client.create(); // Creates an instance.
*/

'use strict';

import $ = require('jquery');

class Client
{

  // -------------- Static class data -------------------

  protected static instance: Client;

  //------------------ Private data ---------------------

  // --- singleton instances ---
  // (There is only one such instance per client.)

  /// Example
  ///private telnetServer = new TelnetServer(Server.DEFAULT_TELNET_PORT);

  // --------------- Static accessors -------------------

  // These are shortcuts so you don't have to use Client.getInstance()

  /// Example
  /*
  public static get game()
  {
    return Server.getInstance().game;
  }
  */
  // ---------------- Static methods --------------------

  public static instanceExists()
  {
    return Client.instance !== null && Client.instance !== undefined;
  }

  public static getInstance()
  {
    if (Client.instance === null || Client.instance === undefined)
      console.log("ERROR: Instance of client doesn't exist yet");

    return Client.instance;
  }

  // Creates an instance of a client. Client is a singleton, so it must
  // not already exist.
  public static create()
  {
    if (Client.instance !== undefined)
    {
      console.log("ERROR: Client already exists, not creating it");
      return;
    }

    Client.instance = new Client();

    // Register event handler 'onDocumentReady'.
    $(document).ready
    (
      // We do it using lambda function in order to correctly
      // initialize 'this' for 'onDocumentReady()' function.
      () => { Client.instance.onDocumentReady(); }      
    );
  }

  // ---------------- Public methods --------------------


  // ---------------- Event handlers --------------------

  // Handles 'document.ready' event.
  // (This event is fired when our web page is completely loaded.)
  private onDocumentReady()
  {
    console.log('onDocumentReady() launched');
  }
}

export = Client;