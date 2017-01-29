/*
  Part of BrutusNEXT

  Encapsulates a web socket.
*/

'use strict';

import ERROR = require('../../error/ERROR');
import Connection = require('../../connection/Connection');

class WebSocketDescriptor
{

  // -------------- Static class data -------------------

  //------------------ Private data ---------------------

  private socket: WebSocket = null;

  // ----------------- Public data ----------------------

  public connection: Connection = null;

  // ---------------- Public methods --------------------

  // Sends a string to the user.
  public send(data: string)
  {
    if (this.socket)
    {
      try
      {
        this.socket.send(data);
      }
      catch (error)
      {
         /// TODO
        ERROR("Websocket ERROR: Failed to send data to the socket."
          + " Reason: " + error.message);
      }
    }
  }

  public connect()
  {
    // Open a web socket;
    this.socket = new WebSocket('ws://localhost:4442');

    if (this.socket === null)
    {
      alert('Failed to open websocket. Either server is down'
        + ' or there is a problem with your internet connection.');
      /// TODO: Vracet false a vubec to nejak korektne zpracovat
      return;
    }

    this.initSocket();
  }

  // Closes the socket, ending the connection.
  public closeSocket()
  {
    this.socket.close();
  }

  // ---------------- Private methods -------------------

  // Attaches event handlers to this.socket.
  private initSocket()
  {
    this.socket.onopen = (event) => { this.onSocketOpen(event); };
    this.socket.onmessage = (event) => { this.onReceivedMessage(event); };
    this.socket.onerror = (event) => { this.onSocketError(event); };
    this.socket.onclose = (event) => { this.onSocketClose(event); };
  }

  // ---------------- Event handlers --------------------

  private onSocketOpen(event: Event)
  {
    console.log('Socket opened');
    /// TODO: (info, že se podařilo připojit).
  }

  private onReceivedMessage(event: MessageEvent)
  {
    ///console.log('Received message: ' + event.data);

    this.connection.receive(event.data);
  }

  private onSocketError(event: ErrorEvent)
  {
    ERROR("Socket error occured: " + event.error
      + " The connection will close");
  }

  private onSocketClose(event: CloseEvent)
  {
    if (event.code === 1000)
    {
      console.log('Socket closed.');
    }
    else
    {
      console.log('Socket closed because of error: ' + event.reason);
    }

    /// TODO: (Info o closntí connection).


    /// Auto reconnect:
    /// (Vyhledove by to taky chtelo timer, aby to zkousel opakovane)
    /*
    // Error code 1000 means that the connection was closed normally.
    if (event.code != 1000)
    {
      // Try to reconnect.
		
      // Test if user is online.
      if (!navigator.onLine)
      {
         alert("You are offline. Please connect to the Internet and try again.");
      }
    }
    */
  }

  // -------------- Protected methods -------------------

}

export = WebSocketDescriptor;