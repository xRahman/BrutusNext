/*
  Part of BrutusNEXT

  Encapsulates a websocket.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {Packet} from '../../..//shared/lib/protocol/Packet';
import {Connection} from '../../../server/lib/net/Connection';
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

  //------------------ Private data ---------------------

  // ----------------- Public data ----------------------

  public connection: Connection = null;

  // ---------------- Public methods --------------------

  public getIpAddress(): string
  {
    return this.ip;
  }

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
        + " " + this.url + " (" + this.ip + "). Reason:"
        + " " + error.message,
        MessageType.WEBSOCKET_SERVER,
        AdminLevel.IMMORTAL
      );
    }
  }

  // Closes the socket, ending the connection.
  public close()
  {
    if (this.webSocket)
      this.webSocket.close();
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
        "Client ERROR: Received binary data from websocket connection"
        + " " + this.url + " (" + this.ip + "). Data is not processed",
        MessageType.WEBSOCKET_SERVER,
        AdminLevel.IMMORTAL
      );
      return;
    }

    /// DEBUG:
    console.log('(ws) received message: ' + data);

    /// TODO: Tohle by se mělo dělat až pro commandy.
    ///data = Utils.normalizeCRLF(data);

    await this.connection.receiveData(data);
  }

  private onOpen()
  {
    /// Asi neni treba nic reportit, uz je zalogovana new connection.
    console.log('Websocket opened');
  }

  private onError(event: Error)
  {
    Syslog.log
    (
      "Websocket ERROR: Error occured on socket"
      + " " + this.url + " (" + this.ip + ")",
      MessageType.WEBSOCKET_SERVER,
      AdminLevel.IMMORTAL
    );
  }

  private onClose
  (
    event:
    {
      wasClean: boolean,
      code: number,
      reason: string,
      target: WebSocket
    }
  )
  {
    // Error code 1000 means that the connection was closed normally.
    if (event.code != 1000)
    {
      Syslog.log
      (
        "Websocket ERROR: Socket " + this.url + " (" + this.ip + ")"
        + " closed because of error: " + event.reason,
        MessageType.WEBSOCKET_SERVER,
        AdminLevel.IMMORTAL
      );
    }
    else
    {
      Syslog.log
      (
        "Websocket ERROR: Socket " + this.url + " (" + this.ip + ")"
        + " closed normally",
        MessageType.WEBSOCKET_SERVER,
        AdminLevel.IMMORTAL
      );
    }
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

    this.webSocket.onopen = (event) => { this.onOpen(); };
    this.webSocket.onerror = (event) => { this.onError(event); };
    this.webSocket.onclose = (event) => { this.onClose(event); };
  }
}