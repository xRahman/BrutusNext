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

  // IP address.
  public get ipAddress() { return this.socketDescriptor.getIpAddress(); }

  public get ingameEntity(): GameEntity
  {
    if (!ASSERT(this.ingameEntityId !== null,
        "Attempt to access gameEntity on PlayerConnection which doesn't have"
        + " any assigned yet"))
      return null;

    return Game.entities.getItem(this.ingameEntityId);
  }

  public get account()
  {
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
    this.stage = PlayerConnection.stage.QUITTED_GAME;
    // Disconnect the player. Event 'close' will be generated on the socket,
    // which will lead to the player being logged out.
    this.socketDescriptor.disconnect();
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

    let lastLoginDate = "unknown date"

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

    this.accountId = account.id;
    account.playerConnectionId = this.id;
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
    // to it informing of usurping of connection and close it.
    if (oldConnection)
    {
      oldStage = oldConnection.stage;
      oldIngameEntityId = oldConnection.ingameEntityId;

      // If ids of old a new connection are the same, it means that
      // player is reconnecting using the same connection and so we
      // don't need to announce that his connection has been usurped
      // and we shouldn't close the connection.
      if (!oldConnection.id.equals(this.id))
      {
        oldConnection.announceConnectionBeingUsurped();
        oldConnection.close();
      }
    }

    account.playerConnectionId = this.id;
    this.accountId = account.id;

    Mudlog.log
    (
      account.name + " [" + this.ipAddress + "] has reconnected",
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL
    );

    // If player was in game before and we know what game entity she has
      // been connected, send her back to the game.
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
          "Attempt to start authentication on player connection that already"
          + " has an account assigned");
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

      case PlayerConnection.stage.QUITTED_GAME:
        ASSERT(false, "Player has quitted the game, PlayerConnection"
          + " is not supposed to process any more commands");
        break;

      default:
        ASSERT(false, "Unknown stage");
        break;
    }
  }

  // Close the connection.
  // (Don't call this directly, use dropPlayerConnection() method of
  // PlayerConnectionManager to close the connection. Otherwise you will
  // end up with dangling closed connection).
  public close()
  {
    if (this.stage === PlayerConnection.stage.IN_GAME)
    {
      /// TODO
      // Player was in game and his link has just died.
    }
    else
    {
      // Player was not in game, log him off.
      // (but only if an account is already associated to this player
      // connection. It might not be, for example if player closed his
      // connection before entering password.)
      if (this.accountId !== null)
      {
        Server.accountManager.logOut(this.accountId);
        this.accountId = null;
      }
      else
      {
        let player = "";

        if (this.authProcessor.getAccountName())
          player = "Player " + this.authProcessor.getAccountName();
        else
          player = "Unknown player";

        Mudlog.log(
          player
          + " [" + this.ipAddress + "] closed connection before logging in",
          Mudlog.msgType.SYSTEM_INFO,
          Mudlog.levels.IMMORTAL);
      }
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

    switch (this.lobbyProcessor.getStage())
    {
      case LobbyProcessor.stage.INITIAL:
        ASSERT(false, "LobbyProcessor has not yet been initialized, prompt"
          + " is not supposed be generated yet");
        break;

      case LobbyProcessor.stage.IN_MENU:
        // When player is in lobby, menu is his prompt.
        prompt = LobbyProcessor.GAME_MENU;
        break;

      case LobbyProcessor.stage.NOT_IN_LOBBY:
        /// TODO: Opravdu generovat prompt, kdyz je player ve hre.
        prompt = "&gDummy_ingame_prompt >";
        break;

      default:
        ASSERT(false,
          "Unknown lobby stage: "
          + this.lobbyProcessor.getStage());

        prompt = "&wInvalid prompt >";
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
    gameEntity.playerConnectionId = this.id;
  }

  public detachFromGameEntity()
  {
    ASSERT(this.ingameEntity !== null,
      "Attempt to detach ingame entity from " + this.account.name + "'s"
      + "player connection when there is no ingame entity attached to it");

    this.ingameEntity.setPlayerConnectionId(null);
    this.ingameEntityId = null;
  }

  // -------------- Protected class data ----------------

  protected authProcessor = new AuthProcessor(this);
  protected lobbyProcessor = new LobbyProcessor(this);

  protected static stage =
  {
    INITIAL: 0, // Initial stage.
    AUTHENTICATION: 1,
    IN_LOBBY: 2,
    IN_GAME: 3,
    QUITTED_GAME: 4
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
    this.sendAsPrompt("Somebody (hopefuly you) has just connected to this"
      + " account. Closing this connection...");
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
}