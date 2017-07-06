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
import {LoginResponse} from '../../../shared/lib/protocol/LoginResponse';
import {RegisterRequest} from '../../../shared/lib/protocol/RegisterRequest';
import {RegisterResponse} from '../../../shared/lib/protocol/RegisterResponse';

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

  //------------------ Private data ---------------------

  protected socket: ServerSocket = null;

  // -------- Public stage transition methods -----------

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
    switch (packet.getClassName())
    {
      case RegisterRequest.name:
        await this.registerRequest(packet.dynamicCast(RegisterRequest));
        break;

      case LoginRequest.name:
        /// Možná by šel udělat dynamic type check.
        await this.loginRequest(packet.dynamicCast(LoginRequest));
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

    // Encode email address so it can be used as file name
    // (this usualy does nothing because characters that are
    //  not allowed in email addresss are rarely used in e-mail
    //  address - but better be sure).
    let accountName = Utils.encodeEmail(request.email);
    let password = request.password;
    let account: Account = null;

    account = await Accounts.register(accountName, password, this);

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
        "[ERROR]: Failed to create account.\n\n"
        + Message.ADMINS_WILL_FIX_IT,
        RegisterResponse.Result.FAILED_TO_CREATE_ACCOUNT
      );
      return;
    }

    this.acceptRegisterRequest(account);
  }

  private acceptLoginRequest(account: Account)
  {
    let response = new LoginResponse();
    response.result = LoginResponse.Result.OK;
    
    // Add newly create account to the response.
    response.account.serializeEntity
    (
      account,
      Serializable.Mode.SEND_TO_CLIENT
    );

    this.send(response);
  }

  private denyLoginRequest
  (
    problem: string,
    result: LoginResponse.Result
  )
  {
    let response = new LoginResponse();

    response.result = result;
    response.problem = problem;

    this.send(response);
  }

  private authenticate(account, password)
  {
    if (!account.validatePassword(password))
      return false;

    this.denyLoginRequest
    (
      "Incorrect password.",
      LoginResponse.Result.INCORRECT_PASSWORD
    );

    return true;
  }

  private announceReconnect()
  {
    let message = new Message
    (
      "Someone (hopefully you) has just logged into this account"
      + " from different location. Closing this connection.",
      MessageType.CONNECTION_INFO
    );

    this.sendMudMessage(message);
  }

  private reconnectToAccount(accountName: string, password: string)
  {
    // Check if account is already loaded in memory.
    let account = Accounts.get(accountName);

    if (!account)
      return false;

    if (!this.authenticate(account, password))
      return false;

    if (!account.getConnection())
    {
      // This should never happen.
      ERROR("Invalid connection on account " + account.getErrorIdString());
      return;
    }

    // Let the old connection know that is has been usurped
    // (we don't have to worry about not sending this message
    //  when player just reloads her broswer tab, because in
    //  that case browser closes the old connection so the serves
    //  has already dealocated the account so connectToAccount()
    //  has been called rather than reconnectToAccount().
    account.getConnection().announceReconnect();

    account.detachConnection().close();
    account.attachConnection(this);

    this.acceptLoginRequest(account);

    return true;
  }

  private async connectToAccount(accountName: string, password: string)
  {
    let account = await ServerEntities.loadEntityByName
    (
      Account,  // Typecast.
      accountName,
      Entity.NameCathegory.ACCOUNT,
      false     // Do not report 'not found' error.
    );

    if (account === undefined)
    {
      this.denyLoginRequest
      (
        "No account is registered for this e-mail address.",
        LoginResponse.Result.UNKNOWN_EMAIL
      );
      return;
    }

    if (account === null)
    {
      this.denyLoginRequest
      (
        "[ERROR]: Failed to load account.\n\n"
        + Message.ADMINS_WILL_FIX_IT,
        LoginResponse.Result.FAILED_TO_LOAD_ACCOUNT
      );
      return;
    }

    if (this.authenticate(account, password))
      return;

    account.attachConnection(this);

    this.acceptLoginRequest(account);
  }

  private async loginRequest(request: LoginRequest)
  {
    if (this.account !== null)
    {
      ERROR("Login request is triggered on connection that has"
        + " account (" + this.account.getErrorIdString() + ")"
        + " attached to it. Login request can only be processed"
        + " on connection with no account attached yet. Request"
        + " is not processed");
      return;
    }

    // E-mail address is used as account name but it needs
    // to be encoded first so it can be used as file name.
    let accountName = Utils.encodeEmail(request.email);
    let password = request.password;

    // If player has already been connected prior to this
    // login request (for example if she logs in from different
    // computer or browser tab while still being logged-in from
    // the old location), her Account is still loaded in memory
    // (because it is kept there as long as connection stays open).
    //   In such case, we don't need to load account from disk
    // (because it's already loaded) but we need to close the
    // old connection and socket (if it's still open) and also
    // possibly let the player know that her connection has been
    // usurped.
    if (this.reconnectToAccount(accountName, password))
      return;

    // If account 'accountName' doesn't exist in memory,
    // we need to load it from disk and connect to it.
    // This also handles situation when user reloads
    // browser tab - browser closes the old connection
    // in such case so at the time user logs back in
    // server has already dealocated old account, connection
    // and socket.
    await this.connectToAccount(accountName, password);
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