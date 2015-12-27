/*
  Part of BrutusNEXT

  A single connection to the game.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {IdableSaveableContainer} from '../shared/IdableSaveableContainer';
import {Mudlog} from '../server/Mudlog';
import {Server} from '../server/Server';
import {SocketDescriptor} from '../server/SocketDescriptor';
import {Account} from '../server/Account';
import {AuthProcessor} from '../server/AuthProcessor';
import {LobbyProcessor} from '../server/LobbyProcessor';
import {Game} from '../game/Game';
import {GameEntity} from '../game/GameEntity';
import {Character} from '../game/characters/Character';

export class PlayerConnection extends IdableSaveableContainer
{
  constructor(protected mySocketDescriptor: SocketDescriptor)
  {
    super();
  }

  // ----------------- Public data ----------------------

  public set id(value: Id) { this.myId = value; }
  public get id() { return this.myId; }

  // Id of player account this connection has logged in with.
  public set accountId(value: Id) { this.myAccountId = value; }
  public get accountId() { return this.myAccountId; }

  // Id of ingame entity this player connection is attached to.
  // (usually the character a player is playing, but it is possible for
  // immortals to 'switch' to any game entity)
  public set ingameEntityId(value: Id) { this.myIngameEntityId = value; }
  public get ingameEntityId() { return this.myIngameEntityId; }

  // IP address.
  public get ipAddress() { return this.mySocketDescriptor.ipAddress; }

  public get ingameEntity(): GameEntity
  {
    if (!ASSERT(this.myIngameEntityId && this.myIngameEntityId.notNull(),
        "Attempt to access gameEntity on PlayerConnection which doesn't have"
        + " any assigned yet"))
      return null;

    return Game.entities.getItem(this.myIngameEntityId);
  }

  public get stage() { return this.myStage; }

  // ------- Internal stage transition methods ----------

  public startLoginProcess()
  {
    ASSERT(this.myStage === PlayerConnection.stage.INITIAL,
      "Starting login process from wrong stage");

    this.myStage = PlayerConnection.stage.AUTHENTICATION;
    this.myAuthProcessor.startLoginProcess();
  }

  public enterLobby()
  {
    this.myStage = PlayerConnection.stage.LOBBY;
    this.myLobbyProcessor.enterMenu();
  }

  public async enterGame()
  {
    ASSERT(this.myStage === PlayerConnection.stage.LOBBY
      || this.myStage === PlayerConnection.stage.IN_GAME,
      "Entering game from wrong stage");
    ASSERT(this.myAccountId && this.myAccountId.notNull(), "Invalid account id");

    this.myStage = PlayerConnection.stage.IN_GAME;

    this.ingameEntity.announcePlayerEnteringGame();
  }

  public reconnectToCharacter()
  {
    this.announceReconnecting();
    this.ingameEntity.announcePlayerReconnecting();

    this.myStage = PlayerConnection.stage.IN_GAME;
  }

  public quitGame()
  {
    this.myStage = PlayerConnection.stage.QUITTED_GAME;
    // Disconnect the player. Event 'close' will be generated on the socket,
    // which will lead to the player being logged out.
    this.mySocketDescriptor.disconnect();
  }

  // ---------------- Public methods --------------------

  // Handles situation when player connects to previously offline account .
  public connectToAccount(account: Account)
  {
    Mudlog.log(
      account.accountName + " [" + this.ipAddress + "] has logged in",
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL);

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
    let oldIngameEntityId = Id.NULL;

    // If old connection is still alive, we need to send a message
    // to it informing of usurping of connection and close it.
    if (oldConnection)
    {
      oldStage = oldConnection.stage;
      oldIngameEntityId = oldConnection.ingameEntityId;
      oldConnection.announceConnectionBeingUsurped();
      oldConnection.close();
    }

    account.playerConnectionId = this.id;
    this.accountId = account.id;

    Mudlog.log
    (
      account.accountName + " [" + this.ipAddress + "] has reconnected",
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL
    );

    if (oldStage === PlayerConnection.stage.IN_GAME
      && oldIngameEntityId
      && oldIngameEntityId.notNull())
    {
      // If player was in game before and we know what game entity she has
      // been connected, send her back to the game.

      // If we know what entity has player been connected to before,
      // connect her to it again.
      this.ingameEntityId = oldIngameEntityId;
      this.reconnectToCharacter();
    }
    else
    {
      // If player was anywhere else before, or if we didn't manage to scan
      // her previous stage or active entity, send her to the lobby.
      this.enterLobby();
    }
  }

  // Parses and executes a single-line command.
  public async processCommand(command: string)
  {
    switch (this.myStage)
    {
      case PlayerConnection.stage.INITIAL:
        ASSERT(false, "PlayerConnection has not yet been initialized by"
          + "startLoginProcess(), it is not supposed to process any"
          + " commands yet");
        break;

      case PlayerConnection.stage.AUTHENTICATION:
        ASSERT(this.myAccountId && this.myAccountId.isNull(),
          "Attempt to start authentication on player connection that already"
          + " has an account assigned");
        await this.myAuthProcessor.processCommand(command);
        break;

      case PlayerConnection.stage.LOBBY:
        ASSERT(this.myAccountId && this.myAccountId.notNull(),
          "Attempt to process lobby command on player connection that doesn't"
          + " have an account assigned");
        this.myLobbyProcessor.processCommand(command);
        break;

      case PlayerConnection.stage.IN_GAME:
        ASSERT(this.myAccountId && this.myAccountId.notNull(),
          "Attempt to process ingame command on player connection that doesn't"
          + " have an account assigned");

        /*
        /// TODO
        /// Tohle je asi taky blbost. Commandy musej umet zpracovatvat primo
        /// mud entity (charactery a tak), aby se pres ne daly ovladat
        /// ze scriptu a tak. Mit naveseny command processor na player
        /// connection je asi zbytecny.
        ///  Tzn. tady to rovnou poslat na online character (respektive
        /// online entitu, protoze to muze byt cokoliv, ne nutne jen character)
        /// (je v principu mozne se switchnout do roomy, objectu, atd.
        /// a davat tomu herni prikazy).
///        this.myGameEntity.processCommand(command);
        /// TESTING:
        this.tmpCharacter1.x = 1;
        this.tmpCharacter2.x = 2;
        this.tmpCharacter3.x = 3;

        this.tmpCharacter1.processCommand(command);
        this.tmpCharacter2.processCommand(command);
        this.tmpCharacter3.processCommand(command);
        */
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
    if (this.myStage === PlayerConnection.stage.IN_GAME)
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
      if (this.myAccountId && this.myAccountId.notNull())
      {
        Server.accountManager.logOut(this.myAccountId);
        this.myAccountId = Id.NULL;
      }
      else
      {
        let player = "";

        if (this.myAuthProcessor.accountName)
          player = "Player " + this.myAuthProcessor.accountName;
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

  // Sends a string to the user.
  public send(data: string)
  {
    this.mySocketDescriptor.send(data);
  }

  public isInGame()
  {
    if (this.ingameEntityId && this.ingameEntityId.notNull())
    {
      ASSERT(this.myStage === PlayerConnection.stage.IN_GAME,
        "Player connection has ingame entity assigned but player connection"
        + " stage is not 'IN_GAME'");

      return true;
    }

    return false;
  }

  // -------------- Protected class data ----------------

  // Empty string means that we do not yet know what account does this
  // descriptor match to.
  protected myAccountId: Id = Id.NULL;

  // Id of entity this player connection is attached to.
  // (usually the character a player is playing, but it is possible for
  // immortals to 'switch' to any game entity)
  protected myIngameEntityId: Id = Id.NULL;

  // Unique stringId of this descriptor.
  protected myId: Id = Id.NULL;

  protected myAuthProcessor = new AuthProcessor(this);
  protected myLobbyProcessor = new LobbyProcessor(this);

  protected static stage =
  {
    INITIAL: 0, // Initial stage.
    AUTHENTICATION: 1,
    LOBBY: 2,
    IN_GAME: 3,
    QUITTED_GAME: 4
  }

  protected myStage = PlayerConnection.stage.INITIAL;

  // -------------- Protected methods -------------------

  protected announceReconnecting()
  {
    this.send("&wYou have reconnected to your character.");
  }

  protected getOldConnection(account: Account): PlayerConnection
  {
    if (account.playerConnectionId && account.playerConnectionId.notNull())
    {
      if (!ASSERT(account.playerConnectionId.equals(this.id),
        "Account is already linked to the connection with which we are trying"
        + " to reconnect to it"))
      {
        return null;
      }

      return account.playerConnection;
    }

    return null;
  }

  protected announceConnectionBeingUsurped()
  {
    this.send("Somebody (hopefuly you) has just connected to this account."
      + " Closing this connection...");
  }
}