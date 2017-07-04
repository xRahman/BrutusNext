/*
  Part of BrutusNEXT

  A connection to the server.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
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

  private acceptRegisterRequest(account: Account)
  {
    let response = new RegisterResponse();
    response.result = RegisterResponse.Result.OK;
    
    // Add newly create account to the response.
    response.account.serializeEntity
    (
      account,
      Serializable.Mode.SEND_TO_CLIENT
    );
    
    this.send(response);
  }

  private denyRegisterRequest
  (
    problem: string,
    result: RegisterResponse.Result
  )
  {
    let response = new RegisterResponse();

    response.result = result;
    response.problem = problem;

    this.send(response);
  }

  private isRegisterRequestOk(request: RegisterRequest): boolean
  {
    let problem = null;

    if (problem = request.getEmailProblem())
    {
      this.denyRegisterRequest
      (
        problem,
        RegisterResponse.Result.EMAIL_PROBLEM
      );
      return false;
    }

    if (problem = request.getPasswordProblem())
    {
      this.denyRegisterRequest
      (
        problem,
        RegisterResponse.Result.PASSWORD_PROBLEM
      );
      return false;
    }

    return true;
  }

  private async registerRequest(request: RegisterRequest)
  {
    if (!this.isRegisterRequestOk(request))
      return;

    let account: Account = null;

    account = await Accounts.register(request, this);

    // 'undefined' means that the name is already taken.
    if (account === undefined)
    {
      this.denyRegisterRequest
      (
        "An account is already registered to this e-mail address.",
        RegisterResponse.Result.EMAIL_PROBLEM
      );
      return;
    }

    if (account === null)
    {
      console.log('denying request');
      this.denyRegisterRequest
      (
        "&R[ERROR]: Failed to create account.\n\n"
        + Message.ADMINS_WILL_FIX_IT,
        RegisterResponse.Result.FAILED_TO_CREATE_ACCOUNT
      );
      return;
    }

    this.acceptRegisterRequest(account);
  }

  private authenticate(account, password)
  {
    if (!account.checkPassword(password))
      return false;

    /// TODO: Send 'login failed' response.

    return true;
  }

  private reconnect(accountName: string, password: string)
  {
    // Check if account is already loaded in memory.
    let account = Accounts.get(accountName);

    if (!account)
      return false;

    if (this.authenticate(account, password))
      return false;

    /// TODO: Nastavení connection atd.

    return true;
  }

  private async login(accountName: string, password: string)
  {
    let account = await ServerEntities.loadEntityByName
    (
      Account, // Typecast.
      accountName,
      Entity.NameCathegory.ACCOUNT
    );

    if (!account)
    {
      /// TODO: ERROR (poslat zpět login response s errorem.)
      return;
    }

    if (this.authenticate(account, password))
      return;

    /// TODO: Nastavení connection atd.
  }

  private async loginRequest(request: LoginRequest)
  {
    // E-mail address is used as account name but it needs
    // to be encoded first so it can be used as file name.
    let accountName = Utils.encodeEmail(request.email);
    let password = request.password;

    if (this.reconnect(accountName, password))
      return;

    await this.login(accountName, password);
  }
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
// export module Connection
// {
// }