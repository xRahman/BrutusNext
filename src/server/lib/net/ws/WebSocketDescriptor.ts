/*
  Part of BrutusNEXT

  Encapsulates a websocket.
*/

'use strict';

import {Packet} from '../../../../shared/protocol/Packet';
///import {PacketData} from '../../../../shared/protocol/PacketData';
import {ERROR} from '../../../../shared/lib/error/ERROR';
import {Utils} from '../../../../server/lib/utils/Utils';
import {ServerSyslog} from '../../../../server/lib/log/Syslog';
import {Message} from '../../../../server/lib/message/Message';
import {AdminLevel} from '../../../../server/lib/admin/AdminLevel';
import {SocketDescriptor} from '../../../../server/lib/net/SocketDescriptor';

import * as WebSocket from 'ws';

// Built-in node.js modules.
// import * as net from 'net';  // Import namespace 'net' from node.js
// import * as events from 'events';  // Import namespace 'events' from node.js

export class WebSocketDescriptor extends SocketDescriptor
{
  constructor(socket: WebSocket, ip: string, url: string)
  {
    super(ip);

    this.url = url;
    this.socket = socket;

    this.initSocket();
  }

  // -------------- Static class data -------------------

  //------------------ Private data ---------------------

  // Remote address url.
  private url: string = null;

  private socket: WebSocket = null;

  // ---------------- Public methods --------------------

  public static parseRemoteUrl(socket: WebSocket)
  {
    if (socket === null || socket === undefined)
    {
      ERROR('Attempt to read ulr from an invalid websocket');
      return null;
    }

    if (socket.upgradeReq === null || socket.upgradeReq === undefined)
    {
      ERROR('Failed to read url from websocket');
      return;
    }

    if (socket.upgradeReq.url === undefined)
    {
      ERROR("Missing url on websocket");

      return null;
    }

    return socket.upgradeReq.url;
  }

  // -> Returns remote ip adress read from 'socket'
  //    or 'null' if it doesn't exist on it.
  public static parseRemoteAddress(socket: WebSocket)
  {
    if (socket === null || socket === undefined)
    {
      ERROR('Attempt to read address from an invalid websocket');
      return null;
    }

    if
    (
      socket.upgradeReq === null
      || socket.upgradeReq === undefined
      || socket.upgradeReq.connection === null
      || socket.upgradeReq.connection === undefined
    )
    {
      ERROR('Failed to read address from websocket');
      return;
    }

    if (socket.upgradeReq.connection.remoteAddress === undefined)
    {
      ERROR("Missing address on websocket");

      return null;
    }

    return socket.upgradeReq.connection.remoteAddress;
  }

  // Sends a mud message to the user.
  public sendMudMessage(message: string)
  {
    let packet = new Packet();
    packet.add(Packet.DataType.MUD_MESSAGE, message);

    this.send(packet);
  }

  // Sends a string to the user.
  public send(packet: Packet)
  {
    try
    {
      this.socket.send(packet.toJson());
    }
    catch (error)
    {
      ServerSyslog.log
      (
        "Client ERROR: Failed to send data to the socket"
        + " " + this.url + " (" + this.ip + "). Reason:"
        + " " + error.message + ".  Data is not processed",
        Message.Type.WEBSOCKET_SERVER,
        AdminLevel.IMMORTAL
      );
    }
  }

  // Closes the socket, ending the connection.
  public closeSocket()
  {
    if (this.socket)
      this.socket.close();
  }

  // ---------------- Event handlers --------------------

  private async onSocketReceivedData(data: any, flags: { binary: boolean })
  {
    if (flags.binary === true)
    {
      // Data is supposed to be sent in text mode.
      //  This is a client error, we can't really do anything about it.
      // So we just log it.
      ServerSyslog.log
      (
        "Client ERROR: Received binary data from websocket connection"
        + " " + this.url + " (" + this.ip + "). Data is not processed",
        Message.Type.WEBSOCKET_SERVER,
        AdminLevel.IMMORTAL
      );
      return;
    }

    /// DEBUG:
    console.log('(ws) received message: ' + data);

    data = Utils.normalizeCRLF(data);

    await this.processInput(data);
  }

  private onSocketOpen()
  {
    /// Asi neni treba nic reportit, uz je zalogovana new connection.
    console.log('Socket opened');
  }

  private onSocketError(event: Error)
  {
    ServerSyslog.log
    (
      "Websocket ERROR: Error occured on socket"
      + " " + this.url + " (" + this.ip + ")",
      Message.Type.WEBSOCKET_SERVER,
      AdminLevel.IMMORTAL
    );
  }

  private onSocketClose
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
      ServerSyslog.log
      (
        "Websocket ERROR: Socket " + this.url + " (" + this.ip + ")"
        + " closed because of error: " + event.reason,
        Message.Type.WEBSOCKET_SERVER,
        AdminLevel.IMMORTAL
      );
    }
    else
    {
      ServerSyslog.log
      (
        "Websocket ERROR: Socket " + this.url + " (" + this.ip + ")"
        + " closed normally",
        Message.Type.WEBSOCKET_SERVER,
        AdminLevel.IMMORTAL
      );
    }
  }

  // -------------- Protected methods -------------------

  // --------------- Private methods --------------------

  // Registers event handlers, etc.
  private initSocket()
  {
    if (this.socket === null || this.socket === undefined)
    {
      ERROR('Attempt to init invalid socket');
      return;
    }

    this.socket.on
    (
      'message',
      (data, flags) => { this.onSocketReceivedData(data, flags); }
    );
    this.socket.onopen = (event) => { this.onSocketOpen(); };
    this.socket.onerror = (event) => { this.onSocketError(event); };
    this.socket.onclose = (event) => { this.onSocketClose(event); };
  }
}