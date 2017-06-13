/*
  Part of BrutusNEXT

  Encapsulates a web socket.
*/

'use strict';

import {ERROR} from '../../../../shared/lib/error/ERROR';
import {Packet} from '../../../../shared/lib/protocol/Packet';
import {Connection} from '../../../../client/lib/connection/Connection';

export class ClientWebSocket
{
  // ---------------- Static methods --------------------

  // Checks if browser supports web sockets.
  public static checkWebSocketsSupport()
  {
    if (WebSocket === undefined)
    {
      // Use 'MozWebSocket' if it's available.
      if ('MozWebSocket' in window)
      {
        WebSocket = window['MozWebSocket'];
        return true;
      }

      alert("Sorry, you browser doesn't support websockets.");
      return false;
    }

    return true;
  }

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

  public isOpen()
  {
    if (this.socket === null)
      return false;

    return this.socket.readyState === WebSocket.OPEN;
  }

  public isConnecting()
  {
    if (this.socket === null)
      return false;

    return this.socket.readyState === WebSocket.CONNECTING;
  }

  public isClosing()
  {
    if (this.socket === null)
      return false;

    return this.socket.readyState === WebSocket.CLOSING;
  }

  public isClosed()
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
    if (!this.isOpen())
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

  // Attempt to open a web socket.
  public connect()
  {
    // (There is no point in error handling here, because
    //  opening a socket is asynchronnous. If an error occurs,
    //  'error' event is fired and onSocketError() is launched.)

    ///this.socket = new WebSocket('ws://127.0.0.1:80/');
    /// Port 80 zjevně není třeba uvádět.
    this.socket = new WebSocket('ws://' + window.location.hostname);

    ///console.log('connect(). Status: ' + this.socket.readyState);

    if (this.socket)
      this.init();
  }

  // Attempts to reconnect.
  public reConnect()
  {
    ///console.log('reConnect(). Status: ' + this.socket.readyState);

    if (this.isOpen())
      // There is no point in reconnecting an open socket.
      return;

    if (this.isConnecting())
      // There is no point if the socket is already trying to connect.
      return;
    
    if (this.isConnecting())
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
  public close()
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
  private init()
  {
    // Remember event listeners so we can close them later.
    this.listeners.onopen = (event) => { this.onOpen(event); };
    this.listeners.onmessage = (event) => { this.onReceiveMessage(event); };
    this.listeners.onerror = (event) => { this.onError(event); };
    this.listeners.onclose = (event) => { this.onClose(event); };

    // Assign them to the socket.
    this.socket.onopen =  this.listeners.onopen;
    this.socket.onmessage = this.listeners.onmessage;
    this.socket.onerror = this.listeners.onerror;
    this.socket.onclose = this.listeners.onclose;
  }

  // Removes event handlers from this.socket.
  private deinit()
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

  private onOpen(event: Event)
  {
    // 'open' event menas that connection has been succesfully
    // established. We remember it so we can later determine
    // if an error means failure to connect or a disconnect.
    this.wasConnected = true;

    ///console.log('onOpen(). Status: ' + this.socket.readyState);
    console.log('Socket opened');
    /// TODO: (info, že se podařilo připojit).
    /// To je asi zbytecny, server posle uvodni 'obrazovku'
  }

  private onReceiveMessage(event: MessageEvent)
  {
    ///console.log('Received message: ' + event.data);

    let packet = new Packet();
    // Copy all own enumerable properties from json data.
    Object.assign(packet, JSON.parse(event.data));   

    for (let part of packet.parts)
    {
      switch (part.type)
      {
        case Packet.DataType.MUD_MESSAGE:
          this.connection.receiveMudMessage(part.data);
          break;
        
        case Packet.DataType.EDITOR_INPUT:
          break;

        case Packet.DataType.EDITOR_OUTPUT:
          break;
      }
    } 
  }

  private onError(event: ErrorEvent)
  {
    ///console.log('onSocketError(). Status: ' + this.socket.readyState);

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

  private onClose(event: CloseEvent)
  {
    ///console.log('onSocketClose(). Status: ' + this.socket.readyState);

    // Remove event handlers from the socket.
    this.deinit();

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