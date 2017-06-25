/*
  Part of BrutusNEXT

  A connection to the server.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {JsonObject} from '../../../shared/lib/json/JsonObject';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {ServerApp} from '../../../server/lib/app/ServerApp';
import {ServerSocket} from '../../../server/lib/net/ServerSocket';
import {Account} from '../../../server/lib/account/Account';
import {Accounts} from '../../../server/lib/account/Accounts';
import {Game} from '../../../server/game/Game';
import {GameEntity} from '../../../server/game/GameEntity';
import {Character} from '../../../server/game/character/Character';
import {Classes} from '../../../shared/lib/class/Classes';
import {Connections} from '../../../server/lib/net/Connections';
import {MudMessage} from '../../../shared/lib/protocol/MudMessage';
import {Packet} from '../../../shared/lib/protocol/Packet';
import {LoginRequest} from '../../../shared/lib/protocol/LoginRequest';
import {RegisterRequest} from '../../../shared/lib/protocol/RegisterRequest';
import {RegisterResponse} from '../../../shared/lib/protocol/RegisterResponse';

export class Connection
{
  // ----------------- Public data ----------------------

  public account: Account = null;
  public ingameEntity: GameEntity = null;

  //------------------ Private data ---------------------

  protected socket: ServerSocket = null;

  // -------- Public stage transition methods -----------

  // ---------------- Public methods --------------------

  public get ipAddress() { return this.socket.getIpAddress(); }

  public setSocket(socket: ServerSocket)
  {
    if (socket === null || socket === undefined)
    {
      ERROR("Invalid socket");
      return;
    } 

    socket.connection = this;
    this.socket = socket;
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

  // --------------- Private methods --------------------

  // Sends 'packet' to web socket.
  private send(packet: Packet)
  {
    this.socket.send
    (
      packet.serialize(Serializable.Mode.SEND_TO_CLIENT)
    );
  }

  // Processes received 'packet'.
  private async receive(packet: Packet)
  {
    /// Možná takhle? Nebo polymorfismus?
    switch (packet.getClassName())
    {
      case RegisterRequest.name:
        /// Možná by šel udělat dynamic type check.
        await this.registerRequest(<RegisterRequest>packet);
        break;

      case LoginRequest.name:
        /// Možná by šel udělat dynamic type check.
        await this.loginRequest(<LoginRequest>packet);
        break;

      default:
        ERROR("Unknown packet type");
        break;
    }
  }

  // private processPacketPart(part: PacketPart)
  // {
  //   switch(part.type)
  //   {
  //     case PacketPart.Type.COMMAND:
  //       break;

  //     case PacketPart.Type.MUD_MESSAGE:
  //       break;

  //     case PacketPart.Type.LOGIN_REQUEST:
  //       this.processLoginRequest(part.data);
  //       break;

  //     case PacketPart.Type.EDITOR_INPUT:
  //       break;

  //     case PacketPart.Type.EDITOR_OUTPUT:
  //       break;

  //     case PacketPart.Type.MAP_CREATE_ROOM:
  //       break;

  //     default:
  //       ERROR("Unknown packet part type");
  //       break;
  //   }
  // }

  private async registerRequest(packet: RegisterRequest)
  {
    let account: Account = null;
    let response = new RegisterResponse();
    let problem = packet.getProblem();

    console.log("Connection.processRegisterRequest() - problem: " + problem);

    /// TODO: Check if account already exists.
    /// (To by mohl dělat rovnou packet.getProblem() - i když asi ne,
    ///  to je shared kód -- možná by neměl bejt, btw).

    if (!problem)
    {
      account = await Accounts.create(packet, this);

      if (account === null)
      {
        problem = "&rFailed to create account./n"
          + Message.PLEASE_CONTACT_ADMINS;
      }
    }

    if (problem)
    {
      response.problem = problem;
      response.accepted = false;

      this.send(response);
      return;
    }

    response.accepted = true;
    
    // Add newly create account to the response.
    response.account.serializeEntity
    (
      account,
      Serializable.Mode.SEND_TO_CLIENT
    );
    
    this.send(response);
  }

  private async loginRequest(packet: LoginRequest)
  {
    /// TODO:
    /*
    let jsonObject = JsonObject.parse(data);
    let request = new LoginRequest();

    request.deserialize(jsonObject);

    if (!request.isValid())
      return;
    */
    
  }
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
// export module Connection
// {
// }