/*
  Part of BrutusNEXT

  Connection to the server.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {ClientSocket} from '../../../client/lib/net/ClientSocket';
import {ScrollWindow} from '../../../client/gui/scroll/ScrollWindow';
import {Avatar} from '../../../client/lib/net/Avatar';
import {Packet} from '../../../shared/lib/protocol/Packet';
import {Command} from '../../../shared/lib/protocol/Command';
import {SystemMessage} from '../../../shared/lib/protocol/SystemMessage';
import {Account} from '../../../client/lib/account/Account';
import {LoginResponse} from '../../../shared/lib/protocol/LoginResponse';
import {RegisterResponse} from '../../../shared/lib/protocol/RegisterResponse';
import {Windows} from '../../../client/gui/Windows';

export class Connection
{
  private socket: ClientSocket = null;

  // -------------- Static class data -------------------

  // ----------------- Public data ----------------------

  public activeAvatar: Avatar = null;

  // ----------------- Private data ---------------------

  private account: Account = null;

  private avatars = new Set<Avatar>();

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  public static send(packet: Packet)
  {
    let connection = ClientApp.connection;

    if (!connection)
    {
      ERROR("Missing or invalid connection. Packet is not sent");
      return;
    }

    connection.send(packet);
  }

  public static receiveData(data: string)
  {
    let connection = ClientApp.connection;

    if (!connection)
    {
      ERROR("Missing or invalid connection. Packet is not processed");
      return;
    }

    let packet = Serializable.deserialize(data);

    if (packet !== null)
      connection.receive(packet);
  }

  // ---------------- Public methods --------------------

  public createAvatar(scrollWindow: ScrollWindow)
  {
    let avatar = new Avatar(scrollWindow);

    this.avatars.add(avatar);

    return avatar;
  }

  // Attempts to open the websocket connection.
  public connect()
  {
    this.socket = new ClientSocket(this);
    this.clientMessage('Opening websocket connection...');
    this.socket.connect();
  }

  // Sends 'command' to the connection.
  public sendCommand(command: string)
  {
    let packet = new Command();

    packet.command = command;

    // If the connection is closed, any user command
    // (even an empty one) triggers reconnect attempt.
    if (!this.socket.isOpen())
      this.socket.reConnect();
    else
      ///this.socket.send(packet.serialize(Serializable.Mode.SEND_TO_SERVER));
      this.send(packet);
  }

  // Sends system message to the connection.
  public sendSystemMessage(type: SystemMessage.Type, message: string)
  {
    let packet = new SystemMessage();

    packet.type = type;
    packet.message = message;

    this.send(packet);
  }

  // Receives 'message' from the connection
  // (appends it to the output of respective scrollwindow).
  public receiveMudMessage(message: string)
  {
    if (this.activeAvatar)
      this.activeAvatar.receiveMessage(message);
  }

  // Outputs a client system message.
  public clientMessage(message: string)
  {
    if (this.activeAvatar)
      this.activeAvatar.clientMessage(message);
  }

  public reportClosingBrowserTab()
  {
    this.sendSystemMessage(SystemMessage.Type.CLIENT_CLOSED_BROWSER_TAB, null);
  }

  public close(reason: string = null)
  {
    if (this.socket)
      this.socket.close(reason);
  }

  // ---------------- Event handlers --------------------

  // ---------------- Private methods -------------------

  private send(packet: Packet)
  {
    if (!this.socket.isOpen())
    {
      ERROR("Attempt to send packet to the closed connection");
      return;
    }

    this.socket.send
    (
      packet.serialize(Serializable.Mode.SEND_TO_SERVER)
    );
  }

  // Processes received 'packet'.
  private receive(packet: Packet)
  {
    switch (packet.getClassName())
    {
      case RegisterResponse.name:
        this.processRegisterResponse(packet.dynamicCast(RegisterResponse));
        break;

      case LoginResponse.name:
        this.processLoginResponse(packet.dynamicCast(LoginResponse));
        break;

      default:
        ERROR("Unknown packet type");
        break;
    }
  }

  private processLoginResponse(response: LoginResponse)
  {
    Windows.loginWindow.form.onResponse();

    if (response.result === LoginResponse.Result.UNDEFINED)
    {
      ERROR("Received login response with unspecified result."
        + " Someone problably forgot to set 'packet.result'"
        + " when sending login response from the server");
      return;
    }

    if (response.result === LoginResponse.Result.OK)
    {
      this.account = response.account.deserializeEntity(Account);
      Windows.loginWindow.form.rememberCredentials();
      ClientApp.setState(ClientApp.State.CHARLIST);
      return;
    }

    // Otherwise display to the user what the problem is.
    Windows.loginWindow.form.displayProblem(response);
  }

  private processRegisterResponse(response: RegisterResponse)
  {
    Windows.registerWindow.form.onResponse();
    
    if (response.result === RegisterResponse.Result.UNDEFINED)
    {
      ERROR("Received register response with unspecified result."
        + " Someone problably forgot to set 'packet.result'"
        + " when sending register response from the server");
      return;
    }

    if (response.result === RegisterResponse.Result.OK)
    {
      this.account = response.account.deserializeEntity(Account);
      /// DEBUG:
      console.log("Recreated account " + JSON.stringify(this.account));

      Windows.registerWindow.form.rememberCredentials();
      ClientApp.setState(ClientApp.State.CHARLIST);
      return;
    }

    // Otherwise display to the user what the problem is.
    Windows.registerWindow.form.displayProblem(response);
  }
}