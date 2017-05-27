/*
  Part of BrutusNEXT

  A connection to the server.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {ServerApp} from '../../../server/lib/app/ServerApp';
import {SocketDescriptor} from '../../../server/lib/net/SocketDescriptor';
import {Account} from '../../../server/lib/account/Account';
import {Accounts} from '../../../server/lib/account/Accounts';
import {Authentication} from '../../../server/lib/connection/Authentication';
import {Menu} from '../../../server/lib/connection/Menu';
import {Chargen} from '../../../server/lib/connection/Chargen';
import {Game} from '../../../server/game/Game';
import {GameEntity} from '../../../server/game/GameEntity';
import {Character} from '../../../server/game/character/Character';
import {Classes} from '../../../shared/lib/class/Classes';
import {Connections} from '../../../server/lib/connection/Connections';

export class Connection
{
  // ----------------- Public data ----------------------

  public account: Account = null;
  public ingameEntity: GameEntity = null;

  //------------------ Private data ---------------------

  private stage: Connection.Stage = null;
  private socketDescriptor: SocketDescriptor = null;
  private authentication: Authentication = null;
  private menu: Menu = null;
  private chargen: Chargen = null;

  // -------- Public stage transition methods -----------

  public startAuthenticating()
  {
    if (this.stage !== null)
      ERROR("Starting authenticating from wrong stage");

    if (this.authentication !== null)
      ERROR("AuthProcessor already exists");

    this.authentication = new Authentication(this);
    this.authentication.startAuthenticating();
    this.stage = Connection.Stage.AUTHENTICATION;
  }

  public finishAuthenticating()
  {
    if (this.authentication === null)
      ERROR("Authenticating is already finished (or it didn't even start)");

    this.authentication = null;
  }

  public enterMenu()
  {
    if (this.menu !== null)
      ERROR("MenuProcessor already exists");

    this.menu = new Menu(this);
    this.menu.sendMenu();
    this.stage = Connection.Stage.IN_MENU;
  }

  public leaveMenu()
  {
    if (this.menu === null)
      ERROR("MenuProcessor is already dealocated");

    this.menu = null;
  }

  public enterChargen()
  {
    if (this.chargen !== null)
      ERROR("ChargenProcessor already exists");

    this.chargen = new Chargen(this);
    this.chargen.start();
    this.stage = Connection.Stage.IN_CHARGEN;
  }

  public leaveChargen()
  {
    if (this.chargen === null)
      ERROR("Chargen processor is already dealocated");

    this.chargen = null;
  }

  // Connection will be attached to 'entity' prior to entering the game.
  public async enterGame(entity: GameEntity)
  {
    let validStage = this.stage === Connection.Stage.IN_MENU
                  || this.stage === Connection.Stage.IN_GAME
                  || this.stage === Connection.Stage.IN_CHARGEN;

    if (!validStage)
      ERROR("Entering game from wrong stage");

    if (this.account === null)
    {
      ERROR("Invalid account when entering game. Game not entered");
      return;
    }

    if (!Entity.isValid(entity))
    {
      ERROR("Invalid entity when entering game. Game not entered");
      return;
    }

    this.attachToGameEntity(entity);

    this.sendConnectionInfo
    (
      "Welcome to the land of &RBrutus&YNext!&_"
      + " May your visit here be... &GInteresting&_."
    );

    this.ingameEntity.announcePlayerEnteringGame();
    this.stage = Connection.Stage.IN_GAME;
  }

  // Connection will be attached to 'entity' prior to entering the game.
  public reconnectToCharacter(entity: GameEntity)
  {
    if (!Entity.isValid(entity))
    {
      ERROR("Invalid entity when entering game. Game not entered");
      return;
    }

    this.attachToGameEntity(entity);

    this.announceReconnecting();
    this.ingameEntity.announcePlayerReconnecting();

    this.stage = Connection.Stage.IN_GAME;
  }

  public returnFromStringEditor()
  {
    /// TODO
  }

  public abortStringEditor()
  {
    /// TODO
  }

  // ---------------- Public methods --------------------

  public get ipAddress() { return this.socketDescriptor.getIpAddress(); }

  public setSocketDescriptor(socketDescriptor: SocketDescriptor)
  {
    if (socketDescriptor === null || socketDescriptor === undefined)
    {
      ERROR("Invalid socket descriptor");
      return;
    } 

    socketDescriptor.connection = this;
    this.socketDescriptor = socketDescriptor;
  }

  /*
  public sendMotd(param: { withPrompt: boolean })
  {
    let motd = "&wThere is no message of the day at this time.";

    // TODO: Umoznit nastavovat MOTD a tady ho posilat, pokud je nastavene.

    if (param.withPrompt)
      this.sendAsBlock(motd);
    else
      this.sendAsPromptlessBlock(motd);
  }
  */

  /*
  public sendLastLoginInfo()
  {
    // Last login info looks like:
    //
    // There was #377256 players since 3.1.2002
    //
    // Last login: localhost at Sat Apr  2 20:40:06 2016

    ///    let numberOfPlayersInfo =
    ///      "&wThere was #" + Server.getNumberOfPlayers()
    ///      + " players since &W3. 4. 2016";

    if (this.account.getLastLoginDate() === null)
    {
      ERROR("Attempt to send last login info of account"
        + " " + this.account.name + " which doesn't have it"
        + " initialized yet");
      return "<unknown date>";
    }

    /// Pozn: Pres telnet samozrejme nezjistim, jaky ma player nastaveny
    /// locale, takze to bude nejspis locale serveru, nebo tak neco.
    /// (Asi by se muselo nastavovat rucne v menu jaky chci mit format
    ///  data a casu)
    /// BTW toLocaleString('cs-CZ') nefunguje, porad je to anglicky format.
    let lastLoginDate = this.account.getLastLoginDate().toLocaleString();

    let lastLoginInfo =
      "&wLast login: " + this.account.getLastLoginAddress()
      + " at " + lastLoginDate;

    this.sendAsBlock(lastLoginInfo);
  }
  */

  // Handles situation when player connects to previously offline account .
  public connectToAccount(account: Account)
  {
    Syslog.log
    (
      account.getName() + " [" + this.ipAddress + "] has logged in",
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    this.account = account;
    account.connection = this;
  }

  // Handles situation when player reconnects to the already loaded
  // account (usualy when she previously lost her link or when she
  // is connecting from different computer without logging out first).
  public reconnectToAccount(account: Account)
  {
    let oldStage = null;
    let oldConnection = account.connection;
    let oldIngameEntity = null;

    // If old connection is still alive, we need to send a message
    // to it informing about usurping of connection and close it.
    if (oldConnection)
    {
      oldStage = oldConnection.stage;
      oldIngameEntity = oldConnection.ingameEntity;

      // If ids of old a new connection are the same, it means that
      // player is reconnecting using the same connection and so we
      // don't need to announce that his connection has been usurped
      // and we shouldn't close the connection.
      // (I'm not sure if it's even possible, but better be sure)
      if (oldConnection !== this)
      {
        oldConnection.announceConnectionBeingUsurped();
        // Set null to oldConnection.accountId to prevent account being
        // logged out when the connection closes.
        oldConnection.account = null;
        
        // Closes the socket, which will trigger 'close' event on it,
        // which will then be handled by closing the connection.
        oldConnection.close();
      }
    }

    account.connection = this;
    this.account = account;

    Syslog.log
    (
      account.getName() + " [" + this.ipAddress + "] has reconnected."
      + " Closing the old connection",
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    // If player was in game before and we know what game entity she has
    // been connected to, send her back to the game.
    if (oldStage === Connection.Stage.IN_GAME
        && oldIngameEntity !== null)
    {

      // If we know what entity has player been connected to before,
      // connect her to it again.
      this.reconnectToCharacter(oldIngameEntity);
    }
    else
    {
      // If player was anywhere else before, or if we didn't manage to
      // retrieve her previous stage or active entity, send her to the menu.
      this.enterMenu();
    }
  }

  // Parses and executes a single-line command.
  public async processCommand(command: string)
  {
    switch (this.stage)
    {
      case null:
        ERROR("Connection has not yet been initialized"
          + " by startLoginProcess(), it is not supposed"
          + " to process any commands yet");
        break;

      case Connection.Stage.AUTHENTICATION:
        await this.processAuthCommand(command);
        break;

      case Connection.Stage.IN_MENU:
        this.processMenuCommand(command);
        break;

      case Connection.Stage.IN_CHARGEN:
        await this.processChargenCommand(command);
        break;

      case Connection.Stage.IN_GAME:
        this.processIngameCommand(command);
        break;

      case Connection.Stage.LOGGED_OUT:
        ERROR("Player is logged out already, Connection"
          + " is not supposed to process any more commands");
        break;

      default:
        ERROR("Unknown stage");
        break;
    }
  }

  // Close the connection.
  public close()
  {
    this.stage = Connection.Stage.LOGGED_OUT;

    // Closes the socket, which will trigger 'close' event on it, which
    // will be handled by calling onSocketClose() on this connection.
    this.socketDescriptor.closeSocket();
  }

  // Handles 'close' event triggered on socket.
  // (Don't call this directly, use this.close() instad. Closing the
  // socket will trigger 'close' event, which will be handled
  // by calling this method).
  public onSocketClose()
  {
    if (this.socketDescriptor.socketClosed === false)
    {
      ERROR("Attempt to call Connection.onSocketClose() before respective"
        + " socket has been closed. Don't call Connection.onSocketClose()"
        + " directly, use connection.close() instead."
        + " That way a 'close' event will be triggered on socket and"
        + " Connection.onSocketClose() will be called from the handler");
    
      return;
    }

    switch (this.stage)
    {
      case null:
        ERROR("Connection has not yet been initialized by"
          + " startLoginProcess(), it is not supposed to process"
          + " any events yet");
        break;

      case Connection.Stage.AUTHENTICATION:
        this.onSocketCloseWhenAuthenticating();
        break;

      case Connection.Stage.IN_MENU:
        this.onSocketCloseWhenInMenu();
        break;

      case Connection.Stage.IN_CHARGEN:
        this.onSocketCloseWhenInChargen();
        break;


      case Connection.Stage.IN_GAME:
        this.onSocketCloseWhenInGame();
        break;

      // Player has correcly exited game from menu.
      case Connection.Stage.LOGGED_OUT:
        this.onSocketCloseWhenLoggedOut();
        break;
    }

    // Release this connection from memory.
    Connections.release(this);
  }

  public isInGame()
  {
    if (this.ingameEntity === null)
      return false;

    if (this.stage !== Connection.Stage.IN_GAME)
    {
      ERROR("Player connection has ingame entity assigned but"
        + " player connection stage is not 'IN_GAME'");
    }

    return true;
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

  public sendMessage(message: Message)
  {
    if (message === null || message === undefined)
    {
      ERROR("Invalid message");
      return;
    }

    this.socketDescriptor.sendMudMessage(message.compose());
  }

  // --------------- Private methods --------------------

  /*
  // Send data to the connection without adding any newlines.
  // (It means that player will type right next to this output.)
  private sendAsPrompt(data: string)
  {
    this.send(data, { asBlock: false, addPrompt: false });
  }

  // Send data as block, followed by prompt.
  // (It means that a newline or an empty line will be added to data,
  //  followed by player's prompt.)
  private sendAsBlock(data: string)
  {
    this.send(data, { asBlock: true, addPrompt: true });
  }

  // Send data as block without prompt.
  // (It means that a newline or an empty line will be added to data,
  //  but no prompt.)
  private sendAsPromptlessBlock(data: string)
  {
    this.send(data, { asBlock: true, addPrompt: false });
  }
  */

  private async processAuthCommand(command: string)
  {
    if (this.authentication === null)
    {
      ERROR("AuthProcessor is not inicialized, command will not be processed"
        + " on account " + this.account.getErrorIdString());
      return;
    }

    await this.authentication.processCommand(command);
  }

  private processMenuCommand(command: string)
  {
    if (this.account === null)
    {
      ERROR("Attempt to process menu command on player"
        + " connection that doesn't have an account assigned");
      return;
    }

    if (this.menu === null)
    {
      ERROR("MenuProcessor is not inicialized"
        + " on account " + this.account.getErrorIdString() + "."
        + " Command will not be processed"); 
      return;
    }

    this.menu.processCommand(command);
  }

  private async processChargenCommand(command: string)
  {
    if (this.account === null)
    {
      ERROR("Attempt to process chargen command on player"
        + " connection that doesn't have an account assigned");
      return;
    }

    if (this.chargen === null)
    {
      ERROR("Chargen processor is not inicialized"
        + " on account " + this.account.getErrorIdString() + "."
        + " Command will not be processed"); 
      return;
    }

    await this.chargen.processCommand(command);
  }

  private processIngameCommand(command: string)
  {
    if (this.account === null)
    {
      ERROR("Attempt to process ingame command on player"
        + " connection that doesn't have an account assigned");
    }

    if (!this.isInGame())
    {
      ERROR("Attempt to process ingame command on player"
        + " connection that doesn't have an ingame entity attached")
    }

    this.ingameEntity.processCommand(command);
  }

  // Send connection-related message to this player connection.
  private sendConnectionInfo(text: string)
  {
    Message.sendToConnection(text, MessageType.CONNECTION_INFO, this);
  }

  private announceReconnecting()
  {
    this.sendConnectionInfo("You have reconnected to your character.");
  }

  private announceConnectionBeingUsurped()
  {
    this.sendConnectionInfo
    (
      "Somebody (hopefuly you) has just connected to this account."
    );
  }

  /*
  // Sends a string to the user.
  // (automatically handles inserting of empty lines)
  private send(data: string, mode: { asBlock: boolean, addPrompt: boolean })
  {
    if (this.isEmpty(data))
      return;

    let newlineCharactersFound = this.countEndingNewlineCharacters(data);

    // Cut off ending newline characters if there are any.
    // (we do trimming here and not inside counting function to save
    //  copying of data if trimming is not needed)
    if (newlineCharactersFound > 0)
      data = data.substring(0, data.length - newlineCharactersFound);

    // Now we are sure that data doesn't end with newline characters.

    // Convert all newline characters to '\r\n'
    if (this.containsNewlineCharacters(data))
      data = this.normalizeNewlineCharacters(data);

    if (mode.asBlock)
    {
      // Now add a default newline to separate messages from each other.
      data += '\r\n';

      // Add another newline if player doesn't have brief mode.
      /// TODO: if (!this.briefMode())
      data += '\r\n';
    }

    if (mode.addPrompt)
    {
      data += this.generatePrompt();
    }

    // Append gray color after any output sent to player.
    // This is to normalize color of player-typed input in raw telnet
    // clients (input is displayed with the color of last output).
    data += '&w';

    this.socketDescriptor.send(data);
  }
  */


  private getPlayedCharacterName(): string
  {
    if (this.ingameEntity !== null)
    {
      return " playing character " + this.ingameEntity.getName();
    }
    else
    {
      return "";
    }
  }

  private isEmpty(data: string): boolean
  {
    if (data === "")
    {
      ERROR("Attempt to send empty string to"
        + " character " + this.getPlayedCharacterName()
        + " on acocunt " + this.account.getName());
      return true;
    }

    return false;
  }

  private countEndingNewlineCharacters(data: string): number
  {
    let newlineCharactersFound = 0;

    // Count number of '\r' or '\n' characters from the end of the string.
    // (ending with just '\r' or '\r\r' or '\n\n' doesn't make sense
    // of course, but endign with correct line break is also an error
    // so we will handle everything the same way.)
    for (let i = data.length - 1; i >= 0; i++)
    {
      if (data.charAt(i) === '\n' || data.charAt(i) === '\r')
        newlineCharactersFound++;
      else
        break;
    }

    // Log an error if any newline characters are found.
    if (newlineCharactersFound > 0)
    {
      ERROR("String '" + data + "' sent to character"
        + " " + this.getPlayedCharacterName() + " on"
        + " account " + this.account.getName() + " ends"
        + " with newline characters. Make sure that you"
        + " don't append any '\\r' or '\\n' characters"
        + " at any combination to any strings that are"
        + " sent to players");
    }

    return newlineCharactersFound;
  }

  /*
  private containsNewlineCharacters(data: string): boolean
  {
    if (data.indexOf('\r') !== -1)
    {
      ERROR("String '" + data + "' sent to character"
        + " " + this.getPlayedCharacterName() + " on"
        + " account " + this.account.name + " contains"
        + " '\\r' characters. Make sure that you only"
        + " use '\\n' in multiline strings");
      return true;
    }

    if (data.indexOf('\n') !== -1)
      return true;

    return false;
  }
  */

  /*
  private normalizeNewlineCharacters(data: string): string
  {
    // Make sure that all newlines are representedy by '\r\n'.
    if (data && data.length)
    {
      // First remove all '\r' characters, then replace all '\n'
      // characters with '\r\n'.
      data = data.replace(/\r/gi, "").replace(/\n/gi, '\r\n');
    }

    return data;
  }
  */

  /*
  private removeSelfFromManager()
  {
    Server.connections.remove(this);
  }
  */

/*
  // Entity removes itself from EntityLists so it can no longer
  // be searched by name, etc. This doesn't remove entity from Entities.
  // (overrides Entity.removeFromlists())
  public removeFromLists()
  {
    ServerApp.connections.remove(this);
  }
*/

  private logoutAccount(action: string)
  {
    if (this.account === null)
    {
      let player = "Unknown player";

      if (this.authentication === null)
      {
        ERROR("AuthProcessor is not inicialized, player won't get logged out");
        return;
      }

      if (this.authentication.getAccountName())
        player = "Player " + this.authentication.getAccountName();

      ERROR("Attempt to logout player " + player + " who is not"
        + " logged-in to an account");
      return;
    }

    this.account.logout(action);
    this.account = null;
  }

  private announcePlayerLostConnection(state: string)
  {
    let player = "Unknown player";
    let accountName = null;

    if (this.authentication !== null)
    {
      accountName = this.authentication.getAccountName()
      ERROR("AuthProcessor not inicialized, lost connection will not be announced");
      return;
    }
    else if(this.account !== null && this.account.isValid())
    {
      accountName = this.account.getName();
    }

    if (accountName !== null)
      player = "Player " + accountName;

    Syslog.log
    (
      player + " [" + this.ipAddress + "]"
      + " lost (or closed) connection" + state,
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );
  }

  private onSocketCloseWhenAuthenticating()
  {
    if (this.account !== null)
    {
      ERROR("Player connection is in AUTHENTICATION stage but has"
        + " an account assigned to it already. That's not supposed"
        + " to happen");

      // This should never be executed, but if an error occurs, it's
      // probably better not to be left with dangling account.
      this.logoutAccount("has been logged out");
    }

    // If the connection is closed while player is authenticating,
    // we also need to remove soft lock on accountName so it is
    // freed to be used.
    if (this.authentication !== null)
    {
      let accountName = this.authentication.getAccountName();

      if (accountName !== null)
        Accounts.removeSoftNameLock(accountName);
    }

    ///this.removeFromLists();
  }

  private onSocketCloseWhenInMenu()
  {
    this.announcePlayerLostConnection(" when in menu");

    if (this.account !== null)
      this.logoutAccount("has been logged out");

    ///this.removeFromLists();
  }

  private onSocketCloseWhenInChargen()
  {
    this.announcePlayerLostConnection(" when in chargen");

    if (this.account !== null)
      this.logoutAccount("has been logged out");

    ///this.removeFromLists();
  }

  private onSocketCloseWhenInGame()
  {
    this.announcePlayerLostConnection(" when in game");

    if (this.account !== null)
      this.logoutAccount("has been logged out");

    if (this.ingameEntity === null)
    {
      ERROR("Player was in game but didn't have ingame"
        + "  entity attached. That's not supposed to happen");
    }

    if (this.ingameEntity)
      this.ingameEntity.detachConnection();

    /// TODO: Neco udelat s ingame entitou (hodit ji link-death).
    /// (momentalne proste zustane viset ve hre)

    ///this.removeFromLists();
  }

  private onSocketCloseWhenLoggedOut()
  {
    if (this.account !== null)
      this.logoutAccount("has logged out");

    ///this.removeFromLists();
  }
}

// ------------------ Type declarations ----------------------

// Module is exported so you can use enum type from outside this file.
// It must be declared after the class because Typescript says so...
export module Connection
{
  export enum Stage
  {
    AUTHENTICATION,
    IN_MENU,
    IN_CHARGEN,
    IN_GAME,
    LOGGED_OUT
  }
}