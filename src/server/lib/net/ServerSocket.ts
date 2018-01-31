/*
  Part of BrutusNEXT

  Encapsulates a websocket.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {WebSocketEvent} from '../../../shared/lib/net/WebSocketEvent';
import {Packet} from '../../..//shared/lib/protocol/Packet';
import {Connection} from '../../../server/lib/connection/Connection';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';

import * as WebSocket from 'ws';

// Built-in node.js modules.
// import * as net from 'net';  // Import namespace 'net' from node.js
// import * as events from 'events';  // Import namespace 'events' from node.js

export class ServerSocket
{
  constructor
  (
    public connection: Connection,
    private webSocket: WebSocket,
    // Remote ip address.
    private ip: string,
    // Remote url.
    private url: string
  )
  {
    this.init();
  }

  // -------------- Static class data -------------------

  // ----------------- Private data ---------------------

  // ----------------- Public data ----------------------

  ///public connection: (Connection | null) = null;

  // --------------- Public accessors -------------------

  public getOrigin()
  {
    return "(" + this.url + " [" + this.ip + "])";
  }

  public getIpAddress(): string
  {
    return this.ip;
  }

  // ---------------- Public methods --------------------

  public static parseRemoteUrl(webSocket: WebSocket)
  {
    if (webSocket === null || webSocket === undefined)
    {
      ERROR('Attempt to read ulr from an invalid websocket');
      return null;
    }

    if (webSocket.upgradeReq === null || webSocket.upgradeReq === undefined)
    {
      ERROR('Failed to read url from websocket');
      return;
    }

    if (webSocket.upgradeReq.url === undefined)
    {
      ERROR("Missing url on websocket");

      return null;
    }

    return webSocket.upgradeReq.url;
  }

  // -> Returns remote ip adress read from 'socket'
  //    or 'null' if it doesn't exist on it.
  public static parseRemoteAddress(webSocket: WebSocket)
  {
    if (webSocket === null || webSocket === undefined)
    {
      ERROR('Attempt to read address from an invalid websocket');
      return null;
    }

    if
    (
      webSocket.upgradeReq === null
      || webSocket.upgradeReq === undefined
      || webSocket.upgradeReq.connection === null
      || webSocket.upgradeReq.connection === undefined
    )
    {
      ERROR('Failed to read address from websocket');
      return;
    }

    if (webSocket.upgradeReq.connection.remoteAddress === undefined)
    {
      ERROR("Missing address on websocket");

      return null;
    }

    return webSocket.upgradeReq.connection.remoteAddress;
  }

  // Sends packet to the client.
  public send(data: string)
  {
    try
    {
      this.webSocket.send(data);
    }
    catch (error)
    {
      Syslog.log
      (
        "Client ERROR: Failed to send packet to websocket"
          + " " + this.getOrigin() + ". Reason: " + error.message,
        MessageType.WEBSOCKET_SERVER,
        AdminLevel.IMMORTAL
      );
    }
  }

  // Closes the socket, ending the connection.
  // -> Returns 'false' if connection couldn't be closed.
  public close()
  {
    if (!this.webSocket)
      return false;
      
    // If the socket is already closed, close() would do nothing.
    if (this.webSocket.readyState === 3)  // '3' means CLOSED.
      return false;

    this.webSocket.close();

    return true;
  }

  // -------------- Protected methods -------------------

  // --------------- Private methods --------------------

  // Registers event handlers, etc.
  private init()
  {
    if (this.webSocket === null || this.webSocket === undefined)
    {
      ERROR('Attempt to init invalid socket');
      return;
    }

    this.webSocket.on
    (
      'message',
      (data, flags) => { this.onReceivedData(data, flags); }
    );

    this.webSocket.onopen = (event: Event) => { this.onOpen(); };
    this.webSocket.onerror = (event: ErrorEvent) => { this.onError(event); };
    this.webSocket.onclose = (event: CloseEvent) => { this.onClose(event); };
  }

  private reportSocketClosingError(event: CloseEvent)
  {
    let message = "Socket " + this.getOrigin() + " closed"
        + " because of error.";

    if (event.reason)
      message += " Reason: " + event.reason;

    message += " Code: " + event.code + ". Description:"
    message += " " + WebSocketEvent.description(event.code);

    Syslog.log
    (
      message,
      MessageType.WEBSOCKET_SERVER,
      AdminLevel.IMMORTAL
    );
  }

  private reportSocketClosing(event: CloseEvent)
  {
    // Error code 1000 means that the connection was closed normally.
    // 'event.reason' is checked because for some reason Chrome sometimes
    // closes webSocket with code 1006 when the tab is closed even though
    // we close() the socket manually in onBeforeUnload() handler (see
    // ClientApp.onBeforeUnload() for more details).
    if (event.code === 1000 || event.reason === WebSocketEvent.REASON_CLOSE)
    {
      Syslog.log
      (
        "Connection " + this.getOrigin() + " has been closed",
        MessageType.WEBSOCKET_SERVER,
        AdminLevel.IMMORTAL
      );
      return;
    }

    this.reportSocketClosingError(event);
  }


  // ---------------- Event handlers --------------------

  private async onReceivedData(data: any, flags: { binary: boolean })
  {
    if (flags.binary === true)
    {
      // Data is supposed to be sent in text mode.
      // (This is a client error, we can't really do
      //  anything about it - so we just log it.)
      Syslog.log
      (
        "Client ERROR: Received binary data from connection"
          + " " + this.getOrigin() + ". Data is not processed",
        MessageType.WEBSOCKET_SERVER,
        AdminLevel.IMMORTAL
      );
      return;
    }

    /// DEBUG:
    console.log('(ws) received message: ' + data);

    await this.connection.receiveData(data);
  }

  private onOpen()
  {
    // No action.
  }

  private onError(event: ErrorEvent)
  {
    Syslog.log
    (
      "Websocket ERROR: Error occured on socket " + this.getOrigin(),
      MessageType.WEBSOCKET_SERVER,
      AdminLevel.IMMORTAL
    );
  }

  private onClose(event: CloseEvent)
  {
    this.reportSocketClosing(event);

    if (!this.connection)
    {
      ERROR("Missing connection reference on socket."
        + " Account and connection won't be released"
        + " from memory");
      return;
    }

    this.connection.release();
  }
}