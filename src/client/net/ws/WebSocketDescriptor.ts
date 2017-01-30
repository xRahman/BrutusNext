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

  // True if the socket is open.
  // (This is not the same as socket === null, because opening
  //  a socket takes some time.)
  private open = false;

  // Here we remember event listeners so we can remove them
  // when tho socket closes.
  private listeners =
  {
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null
  }

  // ----------------- Public data ----------------------

  public connection: Connection = null;

  // ---------------- Public methods --------------------

  public isSocketOpen()
  {
    return this.open;
  }

  // Sends a string to the user.
  public send(data: string)
  {
    // No point in sending data to the closed socket.
    if (this.open === false)
      return;

    if (this.socket)
    {
      try
      {
        this.socket.send(data);
      }
      catch (error)
      {
        ERROR("Websocket ERROR: Failed to send data to the socket."
          + " Reason: " + error.message);
      }
    }
  }

  public connect()
  {
    // Attempt to open a web socket.
    // (There is no point in error handling here, because
    //  opening a socket is asynchronnous. If an error occurs,
    //  'error' event is fired and onSocketError() is launched.)
    this.socket = new WebSocket('ws://localhost:4442');

    if (this.socket)
      this.initSocket();
  }

  // Attempts to reconnect.
  public reConnect()
  {
    if (this.open)
    {
      ERROR("Attempt to reconnect when the connection is open");
      return;
    }

    this.connection.clientMessage
    (
      'Attempting to reconnect...'
    );

    this.connect();
  }

  // Closes the socket, ending the connection.
  public closeSocket()
  {
    this.open = false;

    this.socket.close();
  }

  // ---------------- Private methods -------------------

  private reportConnectionFailure()
  {
    // Test is user device is online.
    if (navigator.onLine)
    {
      this.connection.clientMessage
      (
        'Failed to open websocket connection.'
        + ' Server is down or unreachable.'
      );
    }
    else
    {
      this.connection.clientMessage
      (
        'Failed to open websocket connection. Your device reports'
        + ' offline status. Please check your internet connection.'
      );
    }
  }

  // Prints message to the console.
  private logSocketClosed(event: CloseEvent)
  {
    if (event.reason)
    {
      console.log('Socket closed because of error: ' + event.reason);
    }
    else
    {
      console.log('Socket closed');
    }
  }

  private reportNormalDisconnect()
  {
    this.connection.clientMessage
    (
      'Connection closed.'
    );
  }

  private reportAbnormalDisconnect()
  {
    // If the socket hasn't even been opened, it means that
    // connection couldn't be established. In such case we
    // have already let the user know about it in onSocketError()
    // handler.
    if (this.open === false)
      return;

    // Test if user is online.
    if (navigator.onLine)
    {
      this.connection.clientMessage
      (
        'You have been disconnected from the server.'
      );
    }
    else
    {
      this.connection.clientMessage
      (
        'You have been disconnected. Your device reports'
        + ' offline status, please check your internet connection.'
      );
    }
  }

  // Attaches event handlers to this.socket.
  private initSocket()
  {
    // Remember event listeners so we can close them later.
    this.listeners.onopen = (event) => { this.onSocketOpen(event); };
    this.listeners.onmessage = (event) => { this.onReceiveMessage(event); };
    this.listeners.onerror = (event) => { this.onSocketError(event); };
    this.listeners.onclose = (event) => { this.onSocketClose(event); };

    // Assign them to the socket.
    this.socket.onopen =  this.listeners.onopen;
    this.socket.onmessage = this.listeners.onmessage;
    this.socket.onerror = this.listeners.onerror;
    this.socket.onclose = this.listeners.onclose;
  }

  // Removes event handlers from this.socket.
  private deinitSocket()
  {
    if (this.listeners.onopen)
      this.socket.removeEventListener('open', this.listeners.onopen);

    if (this.listeners.onmessage)
      this.socket.removeEventListener('message', this.listeners.onmessage);
    
    if (this.listeners.onerror)
      this.socket.removeEventListener('error', this.listeners.onerror);

    if (this.listeners.onclose)
      this.socket.removeEventListener('close', this.listeners.onclose);
  }

  // ---------------- Event handlers --------------------

  private onSocketOpen(event: Event)
  {
    this.open = true;

    console.log('Socket opened');
    /// TODO: (info, že se podařilo připojit).
    /// To je asi zbytecny, server posle uvodni 'obrazovku'
  }

  private onReceiveMessage(event: MessageEvent)
  {
    ///console.log('Received message: ' + event.data);

    /// TODO: Parsovani protokolu.
    ///   Do scrollview by se nemel posilat primo event.data,
    //    ale pouze event.data['mudMessage']

    this.connection.receiveMudMessage(event.data);
  }

  private onSocketError(event: ErrorEvent)
  {
    // If the 'error' event fires before 'open' event,
    // it means that connection to the server couldn'to
    // be established.
    if (this.open === false)
    {
      this.reportConnectionFailure();
      return;
    }

    // If 'error' event fired when the connection was open,
    // it will disconnect the player. We just log it to the
    // console for debugging purposes, user will be notified
    // when 'close' event is fired.
    if (event.error)
    {
      ERROR("Socket error occured: " + event.error
        + " The connection will close");
    }
    else
    {
      ERROR("Socket error occured, the connection will close");
    }
  }

  private onSocketClose(event: CloseEvent)
  {
    this.open = false;

    // Remove event handlers from the socket.
    this.deinitSocket();

    this.socket = null;

    // Print message to the console for debugging purposes.
    this.logSocketClosed(event)

    // Let the user know what happened.
    // (Error code 1000 means that the connection was closed normally.)
    if (event.code === 1000)
    {
      this.reportNormalDisconnect();
    }
    else
    {
      this.reportAbnormalDisconnect();

      /// TODO: Auto reconnect:
      /// (Vyhledove by to taky chtelo timer, aby to zkousel opakovane).
    }
  }

  // -------------- Protected methods -------------------

}

export = WebSocketDescriptor;