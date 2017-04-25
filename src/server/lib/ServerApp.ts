/*
  Part of BrutusNEXT

  Implements game server.

  Manages an instance of server application.

  Usage:
    import {Server} from './server/Server';
    Server.create(); // Creates an instance.
    Server.run(port);
*/

'use strict';

import {ERROR} from '../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../shared/lib/error/FATAL_ERROR';
import {App} from '../../shared/lib/App';
import {IdProvider} from '../../server/lib/entity/IdProvider';
import {EntityManager} from '../../server/lib/entity/EntityManager';
import {FileSystem} from '../../server/lib/fs/FileSystem';
import {FlagNamesManager} from '../../server/lib/flags/FlagNamesManager';
import {AdminList} from '../../server/lib/admin/AdminList';
import {AdminLevel} from '../../shared/lib/admin/AdminLevel';
import {Connection} from '../../server/lib/connection/Connection';
import {EntityList} from '../../server/lib/entity/EntityList';
import {PrototypeManager} from '../../server/lib/prototype/PrototypeManager';
import {AccountList} from '../../server/lib/account/AccountList';
import {Syslog} from '../../shared/lib/log/Syslog';
import {Message} from '../../server/lib/message/Message';
import {MessageType} from '../../shared/lib/message/MessageType';
import {Game} from '../../server/game/Game';
import {GameEntity} from '../../server/game/entity/GameEntity';
import {TelnetServer} from '../../server/lib/net/telnet/TelnetServer';
import {WebSocketServer} from '../../server/lib/net/ws/WebSocketServer';
import {HttpServer} from '../../server/lib/net/http/HttpServer';
import {Account} from '../../server/lib/account/Account';

export class ServerApp extends App
{
  public static get DATA_DIRECTORY()
  {
    ///return './data/';
    return './server/data/';
  }

  // -------------- Static class data -------------------

  //protected static instance: Server;

  //------------------ Private data ---------------------

  // 'null' means no message of the day is set at the moment.
  private messageOfTheDay = null;

  // Keeps track of who has which admin rights.
  private adminList = new AdminList();

  private timeOfBoot = new Date();

  // --- singleton instances ---
  // (There is only one such instance per server.)

  private game = null;
  private telnetServer = new TelnetServer();
  /// Http server also runs a websocket server inside it.
  private httpServer = new HttpServer();

  private idProvider = new IdProvider(this.timeOfBoot);

  private saver = new Saver();

  // --------- idLists ---------
  // IdLists contain entity id's.

  private connections = new EntityList();
  private accounts = new AccountList();

  // -------- managers --------
  // Contains all entities (accounts, connections, all game entities).
  protected entityManager = new ServerEntityManager(this.idProvider);

  // Stores prototype object that are not entities
  // (all entities are stored in entityManager, including those
  //  that serve as prototype objects for other entities).
  // Allows creating of instances that have true prototype inheritance model
  // (unlike instances created by 'new Class', which have
  //  all initialized properties as their own properties
  //  rather than inheriting them from prototype object).
  private prototypeManager = new PrototypeManager();

  // flagNamesManager is in Server instead of Game, because flags are needed
  // even outside of game (for example account flags).
  private flagNamesManager = new FlagNamesManager();

  // --------------- Static accessors -------------------

  public static get timeOfBoot()
  {
    if (ServerApp.getInstance().timeOfBoot === null)
      ERROR("Time of boot is not initialized yet");

    return ServerApp.getInstance().timeOfBoot;
  }

  public static get game()
  {
    return ServerApp.getInstance().game;
  }

  public static get accounts()
  {
    return ServerApp.getInstance().accounts;
  }

  public static get connections()
  {
    return ServerApp.getInstance().connections;
  }

  public static get telnetServer()
  {
    return ServerApp.getInstance().telnetServer;
  }

  public static get flagNamesManager()
  {
    return ServerApp.getInstance().flagNamesManager;
  }

  public static get entityManager()
  {
    return ServerApp.getInstance().entityManager;
  }

  public static get prototypeManager()
  {
    return ServerApp.getInstance().prototypeManager;
  }

  // ---------------- Static methods --------------------

  // Loads the game (or creates a new default one
  // if there is no ./data directory).
  public static async run(telnetPort: number)
  {
    ServerApp.getInstance().run(telnetPort);
  }

  protected static getInstance(): ServerApp
  {
    if (ServerApp.instance === null || ServerApp.instance === undefined)
      FATAL_ERROR("Instance of server doesn't exist yet");

    return <ServerApp>App.instance;
  }

  // If there are no admins yet, sets the highest possible admin rights
  // to the character (in other words, the first character created when
  // the mud is 'freshly installed' gets maximum admin rights).
  public static onCharacterCreation(character: GameEntity)
  {
    ServerApp.getInstance().adminList.onCharacterCreation(character);
  }

  public static getAdminLevel(entity: GameEntity)
  {
    return ServerApp.getInstance().adminList.getAdminLevel(entity);
  }

  // Creates an instance of a server. Server is a singleton, so it must
  // not already exist.
  public static create()
  {
    if (App.instance !== null)
    {
      ERROR("Server already exists, not creating it");
      return;
    }

    App.instance = new ServerApp();
  }

  // Sends a message to all player connections
  // (used by Message.sendToAllConnections()).
 
  public static sendToAllConnections(message: Message)
  {
    let connections = ServerApp.getInstance().connections.getEntities();
    let connection: Connection = null;

    for (connection of connections.values())
    {
      // Skip invalid connections.
      if (connection === null || !connection.isValid())
        break;

      message.sendToConnection(connection);
    }
  }

  // Sends a message to all player connections that have an ingame
  // entity attached and have required (or higher) AdminLevel
  // (used by Message.sendToAllIngameConnections()).
  public static sendToAllIngameConnections
  (
    message: Message,
    visibility: AdminLevel
  )
  {
    let connections = ServerApp.getInstance().connections.getEntities();
    let connection: Connection = null;

    for (connection of connections.values())
    {
      // Skip invalid connections.
      if (connection === null || !connection.isValid())
        break;

      // Skip connections that don't have an ingame entity attached.
      if (connection.ingameEntity === null)
        break;

      // Skip connections with invalid ingame entity.
      if (connection.ingameEntity.isValid() === false)
        break;

      // Skip game entities that don't have sufficient admin level
      // to see this message.
      if (ServerApp.getAdminLevel(connection.ingameEntity) < visibility)
        break;

      message.sendToConnection(connection);
    }
  }

  // -> Returns null if no message of the day is set at the moment.
  public static getMotd(): string
  {
    let motd = ServerApp.getInstance().messageOfTheDay;

    if (motd === null)
      return "There is no message of the day at this time.";

    return "&gMessage of the day:\n&_" + motd;
  }

  // ---------------- Public methods --------------------

  // Reports error message and stack trace.
  // (Don't call this method directly, use ERROR()
  //  from /shared/lib/error/ERROR).
  public reportError(message: string)
  {
    let errorMsg = message + "\n"
    + Syslog.getTrimmedStackTrace(Syslog.TrimType.ERROR);

    Syslog.log(errorMsg, Message.Type.RUNTIME_ERROR, AdminLevel.ELDER_GOD);
  }

  // Reports error message and stack trace and terminates the program.
  // (Don't call this method directly, use FATAL_ERROR()
  //  from /shared/lib/error/ERROR).
  public reportFatalError(message: string)
  {
    let errorMsg = message + "\n"
    + Syslog.getTrimmedStackTrace(Syslog.TrimType.ERROR);

    Syslog.log
    (
      errorMsg,
      Message.Type.FATAL_RUNTIME_ERROR,
      AdminLevel.IMMORTAL
    );

    // Because promises are eating exceptions, throwing an error won't stop
    // the program if FATAL_ERROR() is called from within asynchronous method.
    // So we rather print stack trace ourselves (using Syslog.log() above)
    // and exit the program manually.
    process.exit(1);
  }

  // Loads the game (or creates a new default one
  // if there is no ./data directory).
  public async run(telnetPort: number)
  {
    if (this.game !== null)
    {
      ERROR("Game already exists. Server.run() can only be done once");
      return;
    }

    this.game = new Game();

    /// TEST
    ///await test();

    // Create a prototype entitity for each entity classe listed
    // in ClassFactory so they can be used as prototype objects
    // for other entities.
    ClassFactory.createPrototypeEntities()

    /*
    // We must check if './data/' directory exists before
    // initPrototypes() is called, because './data/'
    // will be created by it if it doesn't exist.
    let createDefaultData = !FileSystem.existsSync(ServerApp.DATA_DIRECTORY);

    await this.prototypeManager.init(createDefaultData);

    // 'initPrototypes' may have added new records to the ClassFactory
    // so we need to save them.
    await this.prototypeManager.save();
    */

    // If /server/data/ directory doesn't exist, create and save a new world.
    if (!FileSystem.existsSync(ServerApp.DATA_DIRECTORY))
    {
      // Mark flagNamesManager as ready without loading from file
      // (there is nowhere to load it from so we will just start
      //  with empty instance).
      this.flagNamesManager.ready = true;
      await this.flagNamesManager.save();

      await this.game.createDefaultWorld();
    }
    else
    {
      await this.flagNamesManager.load();
      this.flagNamesManager.ready = true;

      // Load the game.
      await this.game.load();
    }

    this.startTelnetServer(telnetPort);
    /// Http server also starts a websocket server inside it.
    this.startHttpServer();
  }

  // --------------- Protected methods ------------------

  protected syslog
  (
    text: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  {
    return Syslog.log(text, msgType, adminLevel)
  }

  protected getSaver()
  {
    return this.saver;
  }

  protected startTelnetServer(telnetPort: number)
  {
    if (this.telnetServer.isOpen === true)
    {
      ERROR("Telnet server is already running");
      return;
    }

    this.telnetServer.start();
  }

  protected startHttpServer()
  {
    if (this.httpServer.isOpen === true)
    {
      ERROR("Http server is already running");
      return;
    }

    this.httpServer.start();
  }
}