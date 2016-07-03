/*
  Part of BrutusNEXT

  A single connection to the game.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {IdableSaveableObject} from '../shared/IdableSaveableObject';
import {Mudlog} from '../server/Mudlog';
import {Server} from '../server/Server';
import {SocketDescriptor} from '../server/SocketDescriptor';
import {Account} from '../server/Account';
import {AuthProcessor} from '../server/AuthProcessor';
import {LobbyProcessor} from '../server/LobbyProcessor';
import {Game} from '../game/Game';
import {GameEntity} from '../game/GameEntity';
import {Character} from '../game/characters/Character';

export class PlayerConnection extends IdableSaveableObject
{
  constructor(protected socketDescriptor: SocketDescriptor)
  {
    super();
  }

  // ----------------- Public data ----------------------

  public setId(id: Id)
  {
    this.socketDescriptor.setPlayerConnectionId(id);
    super.setId(id);
  }

  public get ipAddress() { return this.socketDescriptor.getIpAddress(); }

  public get ingameEntity(): GameEntity
  {
    if (this.ingameEntityId === null)
      return null;

    return Game.entities.getItem(this.ingameEntityId);
  }

  public get account()
  {
    if (this.accountId === null)
      return null;

    let accountManager = Server.accountManager;

    return accountManager.getItem(this.accountId);
  }

  // Empty string means that we do not yet know what account does this
  // connection match to.
  public accountId: Id = null;

  // Id of entity this player connection is attached to.
  // (usually the character a player is playing, but it is possible for
  // immortals to 'switch' to any game entity)
  public ingameEntityId: Id = null;

  // ------- Internal stage transition methods ----------

  public startLoginProcess()
  {
    ASSERT(this.stage === PlayerConnection.stage.INITIAL,
      "Starting login process from wrong stage");

    this.stage = PlayerConnection.stage.AUTHENTICATION;
    this.authProcessor.startLoginProcess();
  }

  public enterLobby()
  {
    this.stage = PlayerConnection.stage.IN_LOBBY;
    this.lobbyProcessor.enterMenu();
  }

  public async enterGame()
  {
    ASSERT(this.stage === PlayerConnection.stage.IN_LOBBY
        || this.stage === PlayerConnection.stage.IN_GAME,
      "Entering game from wrong stage");

    ASSERT(this.accountId !== null,
      "Invalid account id");

    this.stage = PlayerConnection.stage.IN_GAME;

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

    this.stage = PlayerConnection.stage.IN_GAME;
  }

  public quitGame()
  {
    this.stage = PlayerConnection.stage.LOGGED_OUT;

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

    let lastLoginDate = "unknown date";

    if (ASSERT(this.account.getLastLoginDate() !== null,
      "Attempt to send last login info of account "
      + this.account.name + " which doesn't have it"
      + " initialized yet"))
    {
      /// Pozn: Pres telnet samozrejme nezjistit, jaky ma player nastaveny
      /// locale, takze to bude nejspis locale serveru, nebo tak neco.
      /// (Asi by se muselo nastavovat rucne v menu jaky chci mit format
      ///  data a casu)
      /// BTW toLocaleString('cs-CZ') nefunguje, porad je to anglicky format.
      lastLoginDate = this.account.getLastLoginDate().toLocaleString();
    }

    let lastLoginInfo =
      "&wLast login: " + this.account.getLastLoginAddress()
      + " at " + lastLoginDate;

///    this.sendAsPromptlessBlock(numberOfPlayersInfo);

    this.sendAsBlock(lastLoginInfo);
  }

  // Handles situation when player connects to previously offline account .
  public connectToAccount(account: Account)
  {
    Mudlog.log
    (
      account.name + " [" + this.ipAddress + "] has logged in",
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL
    );

    this.accountId = account.getId();
    account.playerConnectionId = this.getId();
    this.enterLobby();
  }

  // Handles situation when player reconnects to the already loaded
  // account (usualy when she previously lost her link or when she
  // is connecting from different computer without logging out first).
  public reconnectToAccount(account: Account)
  {
    let accountManager = Server.accountManager;
    let oldStage = PlayerConnection.stage.INITIAL;
    let oldConnection = this.getOldConnection(account);
    let oldIngameEntityId = null;

    // If old connection is still alive, we need to send a message
    // to it informing about usurping of connection and close it.
    if (oldConnection)
    {
      oldStage = oldConnection.stage;
      oldIngameEntityId = oldConnection.ingameEntityId;

      // If ids of old a new connection are the same, it means that
      // player is reconnecting using the same connection and so we
      // don't need to announce that his connection has been usurped
      // and we shouldn't close the connection.
      // (I'm not sure if it's even possible, but better be sure)
      if (!oldConnection.getId().equals(this.getId()))
      {
        oldConnection.announceConnectionBeingUsurped();
        // Set null to oldConnection.accountId to prevent account being
        // logged out when the connection closes.
        oldConnection.accountId = null;
        
        // Closes the socket, which will trigger 'close' event on it,
        // which will then be handled by closing the connection.
        oldConnection.close();
      }
    }

    account.playerConnectionId = this.getId();
    this.accountId = account.getId();

    Mudlog.log
    (
      account.name + " [" + this.ipAddress + "] has reconnected."
      + " Closing the old connection",
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL
    );

    // If player was in game before and we know what game entity she has
    // been connected to, send her back to the game.
    if (oldStage === PlayerConnection.stage.IN_GAME
        && oldIngameEntityId !== null)
    {

      // If we know what entity has player been connected to before,
      // connect her to it again.
      this.ingameEntityId = oldIngameEntityId;
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
      case PlayerConnection.stage.INITIAL:
        ASSERT(false, "PlayerConnection has not yet been initialized by"
          + "startLoginProcess(), it is not supposed to process any"
          + " commands yet");
      break;

      case PlayerConnection.stage.AUTHENTICATION:
        ASSERT(this.accountId === null,
          "Attempt to process authentication command on player connection"
          + "  that already has an account assigned");
        await this.authProcessor.processCommand(command);
      break;

      case PlayerConnection.stage.IN_LOBBY:
        ASSERT(this.accountId !== null,
          "Attempt to process lobby command on player connection that doesn't"
          + " have an account assigned");
        this.lobbyProcessor.processCommand(command);
      break;

      case PlayerConnection.stage.IN_GAME:
        ASSERT(this.accountId !== null,
          "Attempt to process ingame command on player connection that doesn't"
          + " have an account assigned");

        ASSERT(this.isInGame(),
          "Attempt to process ingame command on player connection that doesn't"
          + " have an ingame entity attached")

        this.ingameEntity.processCommand(command);
      break;

      case PlayerConnection.stage.LOGGED_OUT:
        ASSERT(false, "Player is logged out already, PlayerConnection"
          + " is not supposed to process any more commands");
      break;

      default:
        ASSERT(false, "Unknown stage");
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
    if (!ASSERT(this.socketDescriptor.socketClosed === true,
      "Attempt to call PlayerConnection:onSocketClose() before respective"
      + " socket has been closed. Don't call PlayerConnection::onSocketClose()"
      + " directly, use playerConnection.close() instead."
      + " That way a 'close' event will be triggered on socket and"
      + " PlayerConnection::onSocketClose() will be called from the handler."))
    {
      return;
    }

    switch (this.stage)
    {
      case PlayerConnection.stage.INITIAL:
        ASSERT(false, "PlayerConnection has not yet been initialized by"
          + "startLoginProcess(), it is not supposed to process any"
          + " events yet");
      break;

      case PlayerConnection.stage.AUTHENTICATION:
        this.onSocketCloseWhenAuthenticating();
      break;

      case PlayerConnection.stage.IN_LOBBY:
        this.onSocketCloseWhenInLobby();
      break;

      case PlayerConnection.stage.IN_GAME:
        this.onSocketCloseWhenInGame();
      break;

      // Player has correcly exited game from menu.
      case PlayerConnection.stage.LOGGED_OUT:
        this.onSocketCloseWhenLoggedOut();
      break;
    }
  }

  // Send data to the connection without adding any newlines.
  // (It means that player will type right next to this output)
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
      case PlayerConnection.stage.INITIAL:
        ASSERT(false, "PlayerConnection has not yet been initialized by"
          + "startLoginProcess(), it is not supposed generate prompt yet");
      break;

      case PlayerConnection.stage.AUTHENTICATION:
        // generatePrompt() is not used while player is authenticating,
        // because it would lead to lots of internal states like "failed
        // password attempt", "password too short", etc.
        ASSERT(false, "Player is authenticating, generatePrompt() should"
          + " not be called right now");
      break;

      case PlayerConnection.stage.IN_LOBBY:
        prompt = this.lobbyProcessor.generatePrompt();
      break;

      case PlayerConnection.stage.IN_GAME:
        if (ASSERT(this.ingameEntity !== null,
          "Attempt to generatePrompt() on playerConnection which doesn't"
          + "have an ingame entity attached"))
        {
          prompt = this.ingameEntity.generatePrompt();
        }
      break;

      // Player has correcly exited game from menu.
      case PlayerConnection.stage.LOGGED_OUT:
        ASSERT(false, "Player has already logged out. PlayerConnection"
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
    if (this.ingameEntityId !== null)
    {
      ASSERT(this.stage === PlayerConnection.stage.IN_GAME,
        "Player connection has ingame entity assigned but player connection"
        + " stage is not 'IN_GAME'");

      return true;
    }

    return false;
  }

  public attachToGameEntity(gameEntity)
  {
    this.ingameEntityId = gameEntity.id;
    gameEntity.playerConnectionId = this.getId();
  }

  public detachFromGameEntity()
  {
    ASSERT(this.ingameEntity !== null,
      "Attempt to detach ingame entity from " + this.account.name + "'s"
      + "player connection when there is no ingame entity attached to it");

    this.ingameEntity.detachPlayerConnection();
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

  protected stage = PlayerConnection.stage.INITIAL;

  // ----------- Auxiliary private methods --------------

  private announceReconnecting()
  {
    this.sendAsBlock("&wYou have reconnected to your character.");
  }

  private getOldConnection(account: Account): PlayerConnection
  {
    if (account.playerConnectionId !== null)
    {
      return account.playerConnection;
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
      ASSERT(false,
        "Attempt to send empty string to account "
        + this.account.name + this.getPlayedCharacterName());

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

    // Log an error (via ASSERT) if any newline characters are found.
    if (newlineCharactersFound > 0)
    {

      ASSERT(false,
        "String '" + data + "' sent to player " + this.account.name
        + this.getPlayedCharacterName() + " ends with newline characters."
        + " Make sure that you don't add no '\\r' or '\\n' characters at any"
        + " combination to the end of any strings that are sent to players");
    }

    return newlineCharactersFound;
  }

  private containsNewlineCharacters(data: string): boolean
  {
    if (data.indexOf('\r') !== -1)
    {
      ASSERT(false,
        "String '" + data + "' sent to player " + this.account.name
        + this.getPlayedCharacterName() + " contains '\\r' characters."
        + " Make sure that you only use '\\n' in multiline strings");

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
    Server.playerConnectionManager.removeItem(this.getId());
  }

  private logoutAccount(action: string)
  {
    if (this.account === null)
    {
      let player = "Unknown player";

      if (this.authProcessor.getAccountName())
      {
        player = "Player " + this.authProcessor.getAccountName();
      }

      ASSERT(false, "Attempt to logout player " + player + " who is not"
        + " logged-in to an account");

      return;
    }

    this.account.logout(action);
    this.accountId = null;
  }

  private announcePlayerLostConnection(state: string)
  {
    let player = "Unknown player";

    if (this.authProcessor.getAccountName())
      player = "Player " + this.authProcessor.getAccountName();

    Mudlog.log
    (
      player + " [" + this.ipAddress + "]"
      + " lost (or closed) connection" + state,
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL
    );
  }

  private onSocketCloseWhenAuthenticating()
  {
    if (!ASSERT(this.accountId === null,
      "Player connection is in AUTHENTICATION stage but has an account"
      + "assigned to it already. That's not supposed to happen"))
    {
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

    ASSERT(this.ingameEntity !== null,
      "Player was in game but didn't have ingame entity attached."
      + " That's not supposed to happen.");

    if (this.ingameEntity)
      this.ingameEntity.detachPlayerConnection();

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