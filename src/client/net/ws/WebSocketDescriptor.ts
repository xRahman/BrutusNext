/*
  Part of BrutusNEXT

  Encapsulates a web socket.
*/

'use strict';

///import ERROR = require('../../error/ERROR');
import {ERROR} from '../../error/ERROR';
///import Connection = require('../../connection/Connection');
import {Connection} from '../../connection/Connection';

export class WebSocketDescriptor
{

  // -------------- Static class data -------------------

  //------------------ Private data ---------------------

  private socket: WebSocket = null;

  // Here we remember event listeners so we can remove them
  // when tho socket closes.
  private listeners =
  {
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null
  }

  // We still need this even though WebSocket keeps it's status
  // in .readyState property. The reason is that events don't know
  // what caused them. If for example the websocket server is down
  // and we try to connect to it, an 'error' and a 'close' events
  // are fired after the timeout. In both cases, socket.readyState
  // is set to WebSocket.CLOSED so we have no way to determine
  // if the connection couldn't even be estableshed or if it was
  // opened and then something caused a disconnect.
  //   To solve this, we set 'this.open' to true only when 'open'
  // event is fired. So when the 'error' or 'close' event comes
  // and 'this.wasConnected' is still false, it means failure to
  // connect, otherwise it means a disconnect.
  private wasConnected = false;

  // ----------------- Public data ----------------------

  public connection: Connection = null;

  // ---------------- Public methods --------------------

  public isSocketOpen()
  {
    if (this.socket === null)
      return false;

    return this.socket.readyState === WebSocket.OPEN;
  }

  public isSocketConnecting()
  {
    if (this.socket === null)
      return false;

    return this.socket.readyState === WebSocket.CONNECTING;
  }

  public isSocketClosing()
  {
    if (this.socket === null)
      return false;

    return this.socket.readyState === WebSocket.CLOSING;
  }

  public isSocketClosed()
  {
    // If we don't have a socket, it's considered closed.
    if (this.socket === null)
      return true;

    return this.socket.readyState === WebSocket.CLOSED;
  }

  // Sends a string to the user.
  public send(data: string)
  {
    // No point in sending data unless the socket is open.
    if (!this.isSocketOpen())
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
    ///this.socket = new WebSocket('ws://localhost:4442');
    this.socket = new WebSocket('ws://78.45.101.53:4442');

    console.log('connect(). Status: ' + this.socket.readyState);

    if (this.socket)
      this.initSocket();
  }

  // Attempts to reconnect.
  public reConnect()
  {
    console.log('reConnect(). Status: ' + this.socket.readyState);

    if (this.isSocketOpen())
      // There is no point in reconnecting an open socket.
      return;

    if (this.isSocketConnecting())
      // There is no point if the socket is already trying to connect.
      return;
    
    if (this.isSocketConnecting())
      // If the socket is still closing, old event handlers are not yet
      // detached so we shouldn't create a new socket yet.
      /// TODO: Asi by to chtelo dát message playerovi a ideálně
      /// pustit auto-reconnect, pokud ještě neběží.
      return;
    
    this.connection.clientMessage
    (
      'Attempting to reconnect...'
    );

    this.connect();
  }

  // Closes the socket, ending the connection.
  public closeSocket()
  {
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
    // 'open' event menas that connection has been succesfully
    // established. We remember it so we can later determine
    // if an error means failure to connect or a disconnect.
    this.wasConnected = true;

    console.log('onSocketOpen(). Status: ' + this.socket.readyState);
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
    console.log('onSocketError(). Status: ' + this.socket.readyState);

    /// Přesunul jsem to do 'onSocketClosed() handleru,
    /// ať je report uživateli na jendom místě.
    /*
    /// Tohle taky možná nebude dobře.
    // If the 'error' event fires before 'open' event,
    // it means that connection to the server couldn't
    // be established.
    if (!this.isSocketConnecting())
    {
      this.reportConnectionFailure();
      return;
    }
    */

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
    console.log('onSocketClose(). Status: ' + this.socket.readyState);

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
      if (this.wasConnected === false)
        // If the connection hasn't even been open, we report
        // the connecting failure.
        this.reportConnectionFailure();
      else
        // Otherwise we report a disconnect.
        this.reportAbnormalDisconnect();

      /// TODO: Auto reconnect:
      /// (Vyhledove by to taky chtelo timer, aby to zkousel opakovane).
    }
  }

  // -------------- Protected methods -------------------

}

///export = WebSocketDescriptor;