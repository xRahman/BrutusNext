/*
  Part of BrutusNEXT

  A single connection to the game.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {Mudlog} from '../server/Mudlog';
import {Server} from '../server/Server';
import {SocketDescriptor} from '../server/SocketDescriptor';
import {AuthProcessor} from '../server/AuthProcessor';
import {LobbyProcessor} from '../server/LobbyProcessor';
import {GameEntity} from '../game/GameEntity';
import {Character} from '../game/Character';

export class PlayerConnection
{
  constructor(protected mySocketDescriptor: SocketDescriptor) {}

  // ----------------- Public data ----------------------

  ///public get socket() { return this.mySocket; }

  public set id(value: Id) { this.myId = value; }
  public get id() { return this.myId; }

  public set accountId(value: Id) { this.myAccountId = value; }
  public get accountId() { return this.myAccountId; }

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
    ASSERT(this.myStage === PlayerConnection.stage.AUTHENTICATION
      || this.myStage === PlayerConnection.stage.IN_GAME,
      "Entering lobby from wrong stage");

    this.myStage = PlayerConnection.stage.LOBBY;
    this.myLobbyProcessor.enterMenu();
  }

  public enterGame()
  {
    ASSERT(this.myAccountId !== null, "Invalid account id");

    let accountManager = Server.accountManager;
    let accountName = accountManager.getAccount(this.myAccountId).accountName;

    this.myStage = PlayerConnection.stage.IN_GAME;

    // For now there can only be one character per account
    // so we don't need to present choice which one to log in with.
    //   Entering game currently means logging in with the character
    // associated to the account.
    if (Server.game.characterManager.exists(accountName))
    {
      /// TODO
      /// Load existing character and enter game.

      /*
      if (loadCharacterFailed())
      {
        // TODO: send explaining message to the player.
        this.enterLobby();
      }
      */
    }
    else
    {
      /// TODO
      /// Create a new character and enter game.
    }
  }

  public quitGame()
  {
    this.myStage = PlayerConnection.stage.QUITTED_GAME;
    // Disconnect the player. Event 'close' will be generated on the socket,
    // which will lead to the player being logged out.
    this.mySocketDescriptor.disconnect();
  }

  // ---------------- Public methods --------------------

  // Parses and executes a single-line command.
  public processCommand(command: string)
  {
    switch (this.myStage)
    {
      case PlayerConnection.stage.INITIAL:
        ASSERT(false, "PlayerConnection has not yet been initialized by"
          + "startLoginProcess(), it is not supposed to process any"
          + " commands yet");
        break;
      case PlayerConnection.stage.AUTHENTICATION:
        ASSERT(this.myAccountId === null,
          "Attempt to start authentication on player connection that already"
          + " has an online account");

        this.myAuthProcessor.processCommand(command);
        break;
      case PlayerConnection.stage.LOBBY:
        ASSERT(this.myAccountId !== null,
          "Attempt to process lobby command on player connection that doesn't"
          + " have an online account");

        this.myLobbyProcessor.processCommand(command);
        break;
      case PlayerConnection.stage.IN_GAME:
        ASSERT(this.myAccountId !== null,
          "Attempt to process ingame command on player connection that doesn't"
          + " have an online account");

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

  // Close the connection
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
      if (this.myAccountId)
      {
        Server.accountManager.logOut(this.myAccountId);
        this.myAccountId = null;
      }
      else
      {
        let address = this.mySocketDescriptor.remoteAddress;
        let player = "";

        if (this.myAuthProcessor.accountName)
        {
          player = "Player " + this.myAuthProcessor.accountName;
        }
        else
        {
          player = "Unknown player";
        }

        Mudlog.log(
          player + " closed connection before logging in",
          Mudlog.msgType.SYSTEM_INFO,
          Mudlog.levels.IMMORTAL);
      }
    }

    Server.playerConnectionManager.removePlayerConnection(this.myId);
  }

  // Sends a string to the user.
  public send(data: string)
  {
    this.mySocketDescriptor.send(data);
  }

  public isInGame()
  {
    return this.myStage === PlayerConnection.stage.IN_GAME;
  }

  // -------------- Protected class data ----------------

  // Empty string means that we do not yet know what account does this
  // descriptor match to.
  protected myAccountId: Id = null;

  // Unique stringId of this descriptor.
  protected myId: Id = null;

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

  /// TESTING
  tmpCharacter1 = new GameEntity({ version: 0 });
  tmpCharacter2 = new GameEntity({ version: 0 });
  tmpCharacter3 = new Character("Zuzka");
}