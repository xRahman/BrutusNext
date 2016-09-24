/*
  Part of BrutusNEXT

  A single connection to the game.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {Entity} from '../../shared/entity/Entity';
import {Syslog} from '../../server/Syslog';
import {AdminLevel} from '../../server/AdminLevel';
import {Server} from '../../server/Server';
import {SocketDescriptor} from '../../server/net/SocketDescriptor';
import {Account} from '../../server/account/Account';
import {AuthProcessor} from '../../server/connection/AuthProcessor';
import {LobbyProcessor} from '../../server/connection/LobbyProcessor';
import {Game} from '../../game/Game';
import {GameEntity} from '../../game/GameEntity';
import {Character} from '../../game/character/Character';

export class Connection extends Entity
{
  private socketDescriptor: SocketDescriptor = null;

  /*
  constructor()
  {
    super();

    socketDescriptor.connection = this;
  }
  */

  public setSocketDescriptor(socketDescriptor: SocketDescriptor)
  {
    socketDescriptor.connection = this;
    this.socketDescriptor = socketDescriptor;
  }

  // ----------------- Public data ----------------------

  /*
  public setId(id: EntityId)
  {
    this.socketDescriptor.setConnectionId(id);
    super.setId(id);
  }
  */

  public get ipAddress() { return this.socketDescriptor.getIpAddress(); }

  /*
  public get ingameEntity(): GameEntity
  {
    if (this.ingameEntityId === null)
      return null;

    return this.ingameEntityId.getEntity({ typeCast: GameEntity });
  }
  */

  /*
  public get account()
  {
    if (this.accountId === null)
      return null;

    return this.accountId.getEntity({ typeCast: Account });
  }
  */

  /*
  // Empty string means that we do not yet know what account does this
  // connection match to.
  public accountId: EntityId = null;
  */
  public account: Account = null;

  /*
  // EntityId of entity this player connection is attached to.
  // (usually the character a player is playing, but it is possible for
  // immortals to 'switch' to any game entity)
  public ingameEntityId: EntityId = null;
  */

  public ingameEntity: GameEntity = null;

  // ------- Internal stage transition methods ----------

  public startLoginProcess()
  {
    if (this.stage !== Connection.stage.INITIAL)
      ERROR("Starting login process from wrong stage");

    this.stage = Connection.stage.AUTHENTICATION;
    this.authProcessor.startLoginProcess();
  }

  public enterLobby()
  {
    this.stage = Connection.stage.IN_LOBBY;
    this.lobbyProcessor.enterMenu();
  }

  public async enterGame()
  {
    let validStage = this.stage === Connection.stage.IN_LOBBY
                  || this.stage === Connection.stage.IN_GAME;

    if (!validStage)
      ERROR("Entering game from wrong stage");

    if (this.account === null)
    {
      ERROR("Invalid account when entering game. Game not eneter");
      return;
    }

    this.stage = Connection.stage.IN_GAME;

    this.sendAsPromptlessBlock
    (
      "\n&gWelcome to the land of &RBrutus&YNext!"
      + " &gMay your visit here be... &GInteresting."
    );

    this.ingameEntity.announcePlayerEnteringGame();
  }

  public reconnectToCharacter()
  {
    this.announceReconnecting();
    this.ingameEntity.announcePlayerReconnecting();

    this.stage = Connection.stage.IN_GAME;
  }

  public quitGame()
  {
    this.stage = Connection.stage.LOGGED_OUT;

    // Close the socket. Event 'close' will be generated on it,
    // which will lead to the player being logged out.
    this.close();
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

  // Overrides Entity.getSaveSubDirectory().
  protected static getSaveSubDirectory()
  {
    // Note:
    //   Because we are in a static method, 'this' is actualy the class
    // constructor and it's properties are static properties of the
    // class.
    return this.className + "/";
  }

  public sendMotd(param: { withPrompt: boolean })
  {
    let motd = "\n&wThere is no message of the day at this time.";

    // TODO: Umoznit nastavovat MOTD a tady ho posilat, pokud je nastavene.

    if (param.withPrompt)
      this.sendAsBlock(motd);
    else
      this.sendAsPromptlessBlock(motd);
  }

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

    /// Pozn: Pres telnet samozrejme nezjistit, jaky ma player nastaveny
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

  // Handles situation when player connects to previously offline account .
  public connectToAccount(account: Account)
  {
    Syslog.log
    (
      account.name + " [" + this.ipAddress + "] has logged in",
      Syslog.msgType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    this.account = account;
    account.connection = this;
    this.enterLobby();
  }

  // Handles situation when player reconnects to the already loaded
  // account (usualy when she previously lost her link or when she
  // is connecting from different computer without logging out first).
  public reconnectToAccount(account: Account)
  {
    let accountManager = Server.accounts;
    let oldStage = Connection.stage.INITIAL;
    let oldConnection = this.getOldConnection(account);
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
      if (oldConnection.getId() !== this.getId())
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
      account.name + " [" + this.ipAddress + "] has reconnected."
      + " Closing the old connection",
      Syslog.msgType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    // If player was in game before and we know what game entity she has
    // been connected to, send her back to the game.
    if (oldStage === Connection.stage.IN_GAME
        && oldIngameEntity !== null)
    {

      // If we know what entity has player been connected to before,
      // connect her to it again.
      this.ingameEntity = oldIngameEntity;
      this.reconnectToCharacter();
    }
    else
    {
      // If player was anywhere else before, or if we didn't manage to
      // retrieve her previous stage or active entity, send her to the lobby.
      this.enterLobby();
    }
  }

  // Parses and executes a single-line command.
  public async processCommand(command: string)
  {
    switch (this.stage)
    {
      case Connection.stage.INITIAL:
        ERROR("Connection has not yet been initialized by"
          + " startLoginProcess(), it is not supposed to process any"
          + " commands yet");
        break;

      case Connection.stage.AUTHENTICATION:
        if (this.account !== null)
        {
          ERROR("Attempt to process authentication command on player"
            + " connection that already has an account assigned");
        }

        await this.authProcessor.processCommand(command);
        break;

      case Connection.stage.IN_LOBBY:
        if (this.account === null)
        {
          ERROR("Attempt to process lobby command on player"
            + " connection that doesn't have an account assigned");
          return;
        }

        this.lobbyProcessor.processCommand(command);
        break;

      case Connection.stage.IN_GAME:
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
        break;

      case Connection.stage.LOGGED_OUT:
        ERROR("Player is logged out already, Connection"
          + " is not supposed to process any more commands");
        break;

      default:
        ERROR("Unknown stage");
        break;
    }
  }

  public close()
  {
    // Closes the socket, which will trigger 'close' event on it, which
    // will be handlec by calling onSocketClose() on this connection.
    this.socketDescriptor.closeSocket();
  }

  // Close the connection.
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
      case Connection.stage.INITIAL:
        ERROR("Connection has not yet been initialized by"
          + " startLoginProcess(), it is not supposed to process"
          + " any events yet");
      break;

      case Connection.stage.AUTHENTICATION:
        this.onSocketCloseWhenAuthenticating();
      break;

      case Connection.stage.IN_LOBBY:
        this.onSocketCloseWhenInLobby();
      break;

      case Connection.stage.IN_GAME:
        this.onSocketCloseWhenInGame();
      break;

      // Player has correcly exited game from menu.
      case Connection.stage.LOGGED_OUT:
        this.onSocketCloseWhenLoggedOut();
      break;
    }
  }

  // Send data to the connection without adding any newlines.
  // (It means that player will type right next to this output.)
  public sendAsPrompt(data: string)
  {
    this.send(data, { asBlock: false, addPrompt: false });
  }

  // Send data as block, followed by prompt.
  // (It means that a newline or an empty line will be added to data,
  //  followed by player's prompt.)
  public sendAsBlock(data: string)
  {
    this.send(data, { asBlock: true, addPrompt: true });
  }

  // Send data as block without prompt.
  // (It means that a newline or an empty line will be added to data,
  //  but no prompt.)
  public sendAsPromptlessBlock(data: string)
  {
    this.send(data, { asBlock: true, addPrompt: false });
  }

  public generatePrompt(): string
  {
    let prompt = "&g>";

    switch (this.stage)
    {
      case Connection.stage.INITIAL:
        ERROR("Connection has not yet been initialized by"
          + " startLoginProcess(), it is not supposed generate"
          + " prompt yet");
        break;

      case Connection.stage.AUTHENTICATION:
        // generatePrompt() is not used while player is authenticating,
        // because it would lead to lots of internal states like "failed
        // password attempt", "password too short", etc.
        ERROR("Player is authenticating, generatePrompt()"
          + " should not be called right now");
        break;

      case Connection.stage.IN_LOBBY:
        prompt = this.lobbyProcessor.generatePrompt();
        break;

      case Connection.stage.IN_GAME:
        if (this.ingameEntity === null)
        {
          ERROR("Attempt to generatePrompt() on connection"
            + " which doesn't have an ingame entity attached");
          break;
        }

        prompt = this.ingameEntity.generatePrompt();
        break;

      // Player has correcly exited game from menu.
      case Connection.stage.LOGGED_OUT:
        ERROR("Player has already logged out. Connection"
          + " is not supposed to generate prompt anymore");
        break;
    }

    // An empty space is added after the prompt to separate it from
    // player input.
    prompt += " ";

    if (this.containsNewlineCharacters(prompt))
      prompt = this.normalizeNewlineCharacters(prompt);

    return prompt;
  }

  public isInGame()
  {
    if (this.ingameEntity === null)
      return false;

    if (this.stage !== Connection.stage.IN_GAME)
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
        + " from " + this.account.name + "'s"
        + " player connection when there is"
        + " no ingame entity attached to it");
    }

    this.ingameEntity.detachConnection();
  }

  // -------------- Protected class data ----------------

  protected authProcessor = new AuthProcessor(this);
  protected lobbyProcessor = new LobbyProcessor(this);

  protected static stage =
  {
    INITIAL: 'INITIAL', // Initial stage.
    AUTHENTICATION: 'AUTHENTICATION',
    IN_LOBBY: 'IN_LOBBY',
    IN_GAME: 'IN_GAME',
    LOGGED_OUT: 'LOGGED_OUT'
  }

  protected stage = Connection.stage.INITIAL;

  // ----------- Auxiliary private methods --------------

  private announceReconnecting()
  {
    this.sendAsBlock("&wYou have reconnected to your character.");
  }

  private getOldConnection(account: Account): Connection
  {
    if (account.connection !== null)
    {
      return account.connection;
    }

    return null;
  }

  private announceConnectionBeingUsurped()
  {
    this.sendAsPromptlessBlock
    (
      "Somebody (hopefuly you) has just connected to this account."
    );
  }

  // Sends a string to the user.
  // (automatically handles inserting of empty lines)
  private send(data: string, mode: { asBlock: boolean, addPrompt: boolean })
  {
    if (this.isDataEmpty(data))
      return;

    let newlineCharactersFound = this.countEndingNewlineCharacters(data);

    // Cut off ending newline characters if there are any.
    // (we do trimming here and not inside counting function to save
    //  copying of data if trimming is not needed)
    if (newlineCharactersFound > 0)
      data = data.substring(0, data.length - newlineCharactersFound);

    // Now we are sure that data doesn't end with newline characters.

    // This converts all newline characters to '\r\n'
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


  private getPlayedCharacterName(): string
  {
    if (this.ingameEntity !== null)
    {
      return " playing character " + this.ingameEntity.name;
    }
    else
    {
      return "";
    }
  }

  private isDataEmpty(data: string): boolean
  {
    if (data === "")
    {
      ERROR("Attempt to send empty string to"
        + " character " + this.getPlayedCharacterName()
        + " on acocunt " + this.account.name);
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
        + " account " + this.account.name + " ends with"
        + " newline characters. Make sure that you don't"
        + " append any '\\r' or '\\n' characters at any"
        + " combination to any strings that are sent to"
        + " players");
    }

    return newlineCharactersFound;
  }

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

  private removeSelfFromManager()
  {
    Server.connections.remove(this);
  }

  private logoutAccount(action: string)
  {
    if (this.account === null)
    {
      let player = "Unknown player";

      if (this.authProcessor.getAccountName())
        player = "Player " + this.authProcessor.getAccountName();

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

    if (this.authProcessor.getAccountName())
      player = "Player " + this.authProcessor.getAccountName();

    Syslog.log
    (
      player + " [" + this.ipAddress + "]"
      + " lost (or closed) connection" + state,
      Syslog.msgType.SYSTEM_INFO,
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

    this.removeSelfFromManager();
  }

  private onSocketCloseWhenInLobby()
  {
    this.announcePlayerLostConnection(" when in menu");

    if (this.account !== null)
      this.logoutAccount("has been logged out");

    this.removeSelfFromManager();
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

    this.removeSelfFromManager();
  }

  private onSocketCloseWhenLoggedOut()
  {
    if (this.account !== null)
      this.logoutAccount("has logged out");

    this.removeSelfFromManager();
  }
}