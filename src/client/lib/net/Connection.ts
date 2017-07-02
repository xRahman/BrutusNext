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
import {Account} from '../../../client/lib/account/Account';
import {RegisterResponse} from '../../../shared/lib/protocol/RegisterResponse';
import {Windows} from '../../../client/gui/Windows';

export class Connection
{
  private socket: ClientSocket = null;

  // -------------- Static class data -------------------

  //------------------ Public data ----------------------

  public activeAvatar: Avatar = null;

  //------------------ Private data ---------------------

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

    // If the connection is closed, any user command
    // (even an empty one) triggers reconnect attempt.
    if (!connection.socket.isOpen())
    {
      ERROR("Attempt to send packet to the closed connection");
      return;
    }

    connection.socket.send
    (
      packet.serialize(Serializable.Mode.SEND_TO_SERVER)
    );
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

  // Sends 'data' to the connection.
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

  // ---------------- Event handlers --------------------

  // ---------------- Private methods -------------------

  private send(packet: Packet)
  {
    this.socket.send
    (
      packet.serialize(Serializable.Mode.SEND_TO_SERVER)
    );
  }

  // Processes received 'packet'.
  private receive(packet: Packet)
  {
    /// Možná takhle? Nebo polymorfismus?
    switch (packet.getClassName())
    {
      case RegisterResponse.name:
        this.processRegisterResponse(<RegisterResponse>packet);
        break;

      default:
        ERROR("Unknown packet type");
        break;
    }
  }

  private processRegisterResponse(response: RegisterResponse)
  {
    // If register request has been accepted, advance to the next
    // application state.
    if (response.result === RegisterResponse.Result.OK)
    {
      this.account = response.account.deserializeEntity(Account);
      /// DEBUG:
      console.log("Recreated account " + JSON.stringify(this.account));
      Windows.registerWindow.registrationSucceeded();
      ClientApp.setState(ClientApp.State.CHARLIST);
      return;
    }

    // Otherwise display to the user what the problem is.
    Windows.registerWindow.displayProblem(response);
  }
}