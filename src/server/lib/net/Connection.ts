/*
  Part of BrutusNEXT

  A connection to the server.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {ServerSocket} from '../../../server/lib/net/ServerSocket';
import {Account} from '../../../server/lib/account/Account';
import {GameEntity} from '../../../server/game/GameEntity';
import {Classes} from '../../../shared/lib/class/Classes';
import {Connections} from '../../../server/lib/net/Connections';
import {MudMessage} from '../../../shared/lib/protocol/MudMessage';
import {Packet} from '../../../shared/lib/protocol/Packet';
import {Login} from '../../../server/lib/net/Login';
import {LoginRequest} from '../../../shared/lib/protocol/LoginRequest';
import {Register} from '../../../server/lib/net/Register';
import {RegisterRequest} from '../../../shared/lib/protocol/RegisterRequest';

export class Connection
{
  constructor(socket: WebSocket, ip: string, url: string)
  {
    let serverSocket = new ServerSocket(socket, ip, url);

    this.setSocket(serverSocket);
  }

  // ----------------- Public data ----------------------

  public account: Account = null;
  public ingameEntity: GameEntity = null;

  // ----------------- Private data ---------------------

  protected socket: ServerSocket = null;

  // --------------- Public accessors -------------------

  public get ipAddress() { return this.socket.getIpAddress(); }

  // ---------------- Public methods --------------------

  // Closes the connection and removes it from memory
  // (this is not possible if it is still linked to an
  //  account).
  public close()
  {
    if (this.account !== null)
    {
      ERROR("Attempt to close connection that is still linked"
        + " to account (" + this.account.getErrorIdString() + ")."
        + " Connection is not closed");
    }

    if (!this.socket)
    {
      ERROR("Unable to close connection because it has no socket"
        + " attached. Removing it from Connections");
      Connections.release(this);
      return;
    }

    if (!this.socket.close())
    {
      // If socket can't be closed (websocket is missing
      // or it's already CLOSED), release the connection
      // from memory. If it can be closed, 'onClose' event
      // will be triggered and it's handler will release
      // the connection.
      Connections.release(this);
    }
  }

  public attachToGameEntity(gameEntity: GameEntity)
  {
    this.ingameEntity = gameEntity;
    gameEntity.connection = this;
  }

  public detachFromGameEntity()
  {
    if (this.ingameEntity === null)
    {
      ERROR("Attempt to detach ingame entity"
        + " from " + this.account.getName() + "'s"
        + " player connection when there is"
        + " no ingame entity attached to it");
    }

    this.ingameEntity.detachConnection();
  }

  public sendMudMessage(message: Message)
  {
    if (message === null || message === undefined)
    {
      ERROR("Invalid message");
      return;
    }

    let packet = new MudMessage();

    packet.message = message.compose();

    this.send(packet);
  }

/// Connection parsuje commandy?
  // Parses and executes a single-line command.
  public async processCommand(command: string)
  {
    /// TODO:
  }

  // Processes data received from the client.
  public async receiveData(data: string)
  {
    let packet = Serializable.deserialize(data);

    if (packet !== null)
      await this.receive(packet);
  }

  // Sends 'packet' to web socket.
  public send(packet: Packet)
  {
    this.socket.send
    (
      packet.serialize(Serializable.Mode.SEND_TO_CLIENT)
    );
  }

  public announceReconnect()
  {
    let message = new Message
    (
      "Someone (hopefully you) has just logged into this account"
        + " from different location. Closing this connection.",
      MessageType.CONNECTION_INFO
    );

    this.sendMudMessage(message);
  }

  // --------------- Private methods --------------------

  private setSocket(socket: ServerSocket)
  {
    if (socket === null || socket === undefined)
    {
      ERROR("Invalid socket");
      return;
    } 

    socket.connection = this;
    this.socket = socket;
  }

  // Processes received 'packet'.
  private async receive(packet: Packet)
  {
    switch (packet.getClassName())
    {
      case RegisterRequest.name:
        await Register.processRequest
        (
          packet.dynamicCast(RegisterRequest),
          this
        );
        break;

      case LoginRequest.name:
        await Login.processRequest
        (
          packet.dynamicCast(LoginRequest),
          this
        );
        break;

      default:
        ERROR("Unknown packet type");
        break;
    }
  }

  // ---------------- Event handlers --------------------

  // Should be called from 'onClose' event on socket.
  public onClose()
  {
    // It's ok if account doesn't exist here, it happens
    // when brower has opened connection but player hasn't
    // logged in yet or when player reconnects from different
    // location and the old connection is closed.
    if (this.account)
      this.account.logout("has been logged out");

    // Release this connection from memory.
    Connections.release(this);
  }
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
// export module Connection
// {
// }