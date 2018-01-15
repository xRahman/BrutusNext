/*
  Part of BrutusNEXT

  A connection to the server.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Connection as SharedConnection} from
  '../../../shared/lib/connection/Connection';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {ServerSocket} from '../../../server/lib/net/ServerSocket';
import {Account} from '../../../server/lib/account/Account';
import {GameEntity} from '../../../server/game/GameEntity';
import {Classes} from '../../../shared/lib/class/Classes';
import {Connections} from '../../../server/lib/connection/Connections';
import {Packet} from '../../../shared/lib/protocol/Packet';
import {MudMessage} from '../../../shared/lib/protocol/MudMessage';

// Force module import (so that the module code is assuredly executed
// instead of typescript just registering a type). This ensures that
// class constructor is added to Classes so it can be deserialized.
import '../../../server/lib/protocol/Command';
import '../../../server/lib/protocol/SystemMessage';
import '../../../server/lib/protocol/LoginRequest';
import '../../../server/lib/protocol/RegisterRequest';
import '../../../server/lib/protocol/ChargenRequest';
import '../../../server/lib/protocol/EnterGameRequest';

export class Connection implements SharedConnection
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

  public getIpAddress() { return this.socket.getIpAddress(); }

  // Connection origin description in format "(url [ip])".
  public getOrigin() { return this.socket.getOrigin() }

  public getUserInfo()
  {
    let info = "";

    if (this.account)
      info += this.account.getEmail() + " ";
    
    // Add (url [ip]).
    info += this.getOrigin();

    return info;
  }

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
      return;
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

  // Processes data received from the client.
  public async receiveData(data: string)
  {
    let packet = Serializable.deserialize(data).dynamicCast(Packet);

    if (packet !== null)
      await packet.process(this);
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

  // ---------------- Event handlers --------------------

  // Releases the connection from memory
  // (should be called from 'onClose' event on socket).
  public release()
  {
    // It's ok if account doesn't exist here, it happens
    // when brower has opened connection but player hasn't
    // logged in yet or when player reconnects from different
    // location and the old connection is closed.
    if (this.account)
    {
      this.account.logout();
      this.account = null;
    }

    // Release this connection from memory.
    Connections.release(this);
  }
}
