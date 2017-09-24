/*
  Part of BrutusNEXT

  Connection to the server.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Connection as SharedConnection} from
  '../../../shared/lib/connection/Connection';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {ClientSocket} from '../../../client/lib/net/ClientSocket';
import {Entity} from '../../../shared/lib/entity/Entity';
import {ClientEntities} from '../../../client/lib/entity/ClientEntities';
import {Windows} from '../../../client/gui/window/Windows';
import {ScrollWindow} from '../../../client/gui/scroll/ScrollWindow';
import {Avatar} from '../../../client/lib/connection/Avatar';
import {Packet} from '../../../shared/lib/protocol/Packet';
import {Command} from '../../../shared/lib/protocol/Command';
import {SystemMessage} from '../../../shared/lib/protocol/SystemMessage';
import {Account} from '../../../client/lib/account/Account';
import {Character} from '../../../client/game/character/Character';

// Force module import (so that the module code is assuredly executed
// instead of typescript just registering a type). This ensures that
// class constructor is added to Classes so it can be deserialized.
import '../../../shared/lib/protocol/EntityMove';
import '../../../client/game/world/Room';
import '../../../client/lib/protocol/LoginResponse';
import '../../../client/lib/protocol/RegisterResponse';
import '../../../client/lib/protocol/ChargenResponse';
import '../../../client/lib/protocol/CharselectResponse';

export class Connection implements SharedConnection
{
  private socket: ClientSocket = null;

  // -------------- Static class data -------------------

  // ----------------- Public data ----------------------

  public activeAvatar: Avatar = null;

  // ----------------- Private data ---------------------

  private account: Account = null;

  private avatars = new Set<Avatar>();

  // --------------- Static accessors -------------------

  public static get account()
  {
    let connection = ClientApp.connection;

    if (!connection)
    {
      ERROR("Missing or invalid connection");
      return;
    }

    return connection.account;
  }

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

  public static async receiveData(data: string)
  {
    let connection = ClientApp.connection;

    if (!connection)
    {
      ERROR("Missing or invalid connection. Packet is not processed");
      return;
    }

    let packet = Serializable.deserialize(data).dynamicCast(Packet);

    if (packet !== null)
      await packet.process(connection);

    // if (packet !== null)
    //   connection.receive(packet);
  }

  public setAccount(account: Account)
  {
    if (!Entity.isValid(account))
    {
      ERROR("Attempt to set invalid account to the connection."
        + " Account is not set.");
      return;
    }

    if (this.account !== null)
    {
      ERROR("Attempt to set account " + account.getErrorIdString()
        + " to the connection when there already is an account set."
        + " Account can only be set to the connection once");
    }

    this.account = account;
  }

  // ---------------- Public methods --------------------

  public createAvatar(character: Character)
  {
    let avatar = new Avatar(character);

    this.avatars.add(avatar);

    // Newly created avatar is automaticaly set as active one
    // (this should only happen when player logs in with a new
    //  character).
    this.activeAvatar = avatar;

    return avatar;
  }

  // Attempts to open the websocket connection.
  public connect()
  {
    if (this.socket !== null)
      ERROR("Socket already exists");

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

  /// Moved to shared/Response
  // private reportInvalidResponse(action: string)
  // {
  //   ERROR("Received " + action + " response with unspecified result."
  //       + " Someone problably forgot to set 'packet.result' when"
  //       + " sending " + action + " response from the server");
  // }

  /// To be deleted.
  // // Processes received 'packet'.
  // private receive(packet: Packet)
  // {
  //   switch (packet.getClassName())
  //   {
  //     case RegisterResponse.name:
  //       this.processRegisterResponse(packet.dynamicCast(RegisterResponse));
  //       break;

  //     case LoginResponse.name:
  //       this.processLoginResponse(packet.dynamicCast(LoginResponse));
  //       break;

  //     case ChargenResponse.name:
  //       this.processChargenResponse(packet.dynamicCast(ChargenResponse));
  //       break;

  //     case CharselectResponse.name:
  //       this.processCharselectResponse(packet.dynamicCast(CharselectResponse));
  //       break;

  //     default:
  //       ERROR("Unknown packet type");
  //       break;
  //   }
  // }


  /// Moved to RegisterResponse.
  // private getAccountFromRegisterResponse(response: RegisterResponse)
  // {
  //   this.account = response.account.deserializeEntity(Account);

  //   if (!Entity.isValid(this.account))
  //   {
  //     ERROR("Invalid account in register response");
  //     return false;
  //   }

  //   return true;
  // }

  /// Moved to RegisterResponse.
  // private processRegisterResponse(response: RegisterResponse)
  // {
  //   Windows.registerWindow.form.onResponse();
    
  //   if (response.result === RegisterResponse.Result.UNDEFINED)
  //   {
  //     this.reportInvalidResponse('register');
  //     return;
  //   }

  //   if (response.result === RegisterResponse.Result.OK)
  //   {
  //     if (!this.getAccountFromRegisterResponse(response))
  //       return;

  //     Windows.registerWindow.form.rememberCredentials();
  //     ClientApp.setState(ClientApp.State.CHARSELECT);
  //     return;
  //   }

  //   // Otherwise display to the user what the problem is.
  //   Windows.registerWindow.form.displayProblem(response);
  // }

  /// Moved to LoginResponse.
  // private extractLoginResponseData(response: LoginResponse)
  // {
  //   this.account = response.account.deserializeEntity(Account);

  //   // Also deserialize characters on the account. We will
  //   // need them to populate character select window.
  //   for (let characterData of response.characters)
  //   {
  //     let character: Character = characterData.deserializeEntity(Character);

  //     this.account.data.updateCharacterReference(character);
  //   }
  // }

  /// Moved to LoginResponse.
  // private processLoginResponse(response: LoginResponse)
  // {
  //   Windows.loginWindow.form.onResponse();

  //   if (response.result === LoginResponse.Result.UNDEFINED)
  //   {
  //     this.reportInvalidResponse('login');
  //     return;
  //   }

  //   if (response.result === LoginResponse.Result.OK)
  //   {
  //     this.extractLoginResponseData(response);
  //     Windows.loginWindow.form.rememberCredentials();
  //     ClientApp.setState(ClientApp.State.CHARSELECT);
  //     return;
  //   }

  //   // Otherwise display to the user what the problem is.
  //   Windows.loginWindow.form.displayProblem(response);
  // }

  /// Moved to ChargenResponse.
  // -> Returns extracted character.
  // private extractChargenResponseData(response: ChargenResponse)
  // {
  //   this.account = response.account.deserializeEntity(Account);

  //   let character = response.character.deserializeEntity(Character);

  //   this.account.data.updateCharacterReference(character);

  //   return character;
  // }

  /// Moved to ChargenResponse.
  // private acceptChargenResponse(response: ChargenResponse)
  // {
  //   let character = this.extractChargenResponseData(response);

  //   ClientApp.setState(ClientApp.State.CHARSELECT);

  //   // Select newly added character
  //   // (we can do it here because ClientApp.setState() called
  //   //  charselectForm.onShow() which created the charplate).
  //   Windows.charselectWindow.form.selectCharacter(character.getId());
  // }

  // /// Moved to ChargenResponse.process()
  // private processChargenResponse(response: ChargenResponse)
  // {
  //   Windows.chargenWindow.form.onResponse();
    
  //   if (response.result === ChargenResponse.Result.UNDEFINED)
  //   {
  //     this.reportInvalidResponse('chargen');
  //     return;
  //   }

  //   if (response.result === ChargenResponse.Result.OK)
  //   {
  //     this.acceptChargenResponse(response);
  //     return;
  //   }

  //   // Otherwise display to the user what the problem is.
  //   Windows.chargenWindow.form.displayProblem(response);
  // }

  /// Moved to CharselectResponse.
  // private getSelectedCharacter(response: CharselectResponse)
  // {
  //   let characterId = response.characterMove.entityId;

  //   let character: Character =
  //     ClientEntities.get(characterId).dynamicCast(Character);

  //   if (!Entity.isValid(character))
  //   {
  //     ERROR("Invalid selected character (id: " + characterId + ")");
  //     return null;
  //   }

  //   return character;
  // }

  /// Moved to CharselectResponse.
  // private getCharacterLoadLocation(response: CharselectResponse)
  // {
  //   // 'loadLocation' entity is added to ClientEntities here as
  //   // side effect. It can later be accessed using it's id.
  //   let loadLocation = response.loadLocation.deserializeEntity(Entity);
    
  //   if (!Entity.isValid(loadLocation))
  //   {
  //     ERROR("Invalid load location in charselect response");
  //     return false;
  //   }

  //   return true;
  // }

  /// Moved to CharselectResponse.
  // private acceptCharselectResponse(response: CharselectResponse)
  // {
  //   let character = this.getSelectedCharacter(response);

  //   if (!character)
  //     return;

  //   this.createAvatar(character);

  //   // Note: This must be done before character.enterWorld(),
  //   // otherwise the room (or other entity the character loads
  //   // into) might not exist on the client.
  //   if (!this.getCharacterLoadLocation(response))
  //     return;

  //   if (!character.enterWorld(response.characterMove))
  //     return;

  //   ClientApp.setState(ClientApp.State.IN_GAME);
  // }

  /// Moved to CharselectResponse.process().
  // private processCharselectResponse(response: CharselectResponse)
  // {
  //   if (response.result === CharselectResponse.Result.UNDEFINED)
  //   {
  //     this.reportInvalidResponse('charselect');
  //     return;
  //   }

  //   if (response.result === CharselectResponse.Result.OK)
  //   {
  //     this.acceptCharselectResponse(response);
  //     return;
  //   }

  //   // Otherwise display to the user what the problem is.
  //   Windows.charselectWindow.form.displayProblem(response);
  // }
}