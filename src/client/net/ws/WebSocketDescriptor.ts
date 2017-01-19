/*
  Part of BrutusNEXT

  Encapsulates a web socket.
*/

'use strict';

class WebSocketDescriptor
{

  // -------------- Static class data -------------------

  //------------------ Private data ---------------------

  private socket: WebSocket = null;

  // ---------------- Public methods --------------------

  // Sends a string to the user.
  public send(data: string)
  {
    this.socket.send(data);
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

  /*
  // Closes the socket, ending the connection.
  public closeSocket()
  {
    this.socket.end();
  }
  */

  // ---------------- Private methods -------------------

  // Attaches event handlers to this.socket.
  private initSocket()
  {
    this.socket.onopen = (event) => { this.onSocketOpen(event); };
    this.socket.onmessage = (event) => { this.onReceivedMessage(event); };
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
    console.log('Received message: ' + event.data);
    /// TODO:
  }

  private onSocketClose(event: CloseEvent)
  {
    console.log('Socket closed');
    /// TODO:
  }

  // -------------- Protected methods -------------------

}

export = WebSocketDescriptor;