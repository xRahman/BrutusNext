/*
  Part of BrutusNEXT

  Implements game server.

  Manages an instance of server application.

  Usage:
    import {ServerApp} from './server/lib/ServerApp';
    ServerApp.run(port);
*/

'use strict';

import {ERROR} from '../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../shared/lib/error/FATAL_ERROR';
import {App} from '../../shared/lib/App';
///import {IdProvider} from '../../server/lib/entity/IdProvider';
import {ClassFactory} from '../../shared/lib/class/ClassFactory';
import {ServerEntityManager} from
  '../../server/lib/entity/ServerEntityManager';
import {FileManager} from '../../server/lib/fs/FileManager';
import {FlagNamesManager} from '../../server/lib/flags/FlagNamesManager';
import {AdminList} from '../../server/lib/admin/AdminList';
import {AdminLevel} from '../../shared/lib/admin/AdminLevel';
import {Connection} from '../../server/lib/connection/Connection';
import {Entity} from '../../shared/lib/entity/Entity';
import {EntityList} from '../../shared/lib/entity/EntityList';
import {ServerPrototypeManager} from
  '../../server/lib/entity/ServerPrototypeManager';
import {AccountList} from '../../server/lib/account/AccountList';
import {Syslog} from '../../shared/lib/log/Syslog';
import {ServerSyslog} from '../../server/lib/log/ServerSyslog';
import {Message} from '../../server/lib/message/Message';
import {MessageType} from '../../shared/lib/message/MessageType';
import {Game} from '../../server/game/Game';
import {ServerGameEntity} from '../../server/game/entity/ServerGameEntity';
import {TelnetServer} from '../../server/lib/net/telnet/TelnetServer';
import {WebSocketServer} from '../../server/lib/net/ws/WebSocketServer';
import {HttpServer} from '../../server/lib/net/http/HttpServer';
import {Account} from '../../server/lib/account/Account';

export class ServerApp extends App
{
  // -------------- Static class data -------------------

  //------------------ Private data ---------------------

  // 'null' means no message of the day is set at the moment.
  private messageOfTheDay = null;

  // Keeps track of who has which admin rights.
  private adminList = new AdminList();

  private timeOfBoot = new Date();

  // --- singleton instances ---
  // (There is only one such instance per server.)

  private game = new Game();

  private telnetServer = new TelnetServer();

  /// Http server also runs a websocket server inside it.
  private httpServer = new HttpServer();

  // --------- idLists ---------
  // IdLists contain entity id's.

  private connections = new EntityList();
  private accounts = new AccountList();

  // -------- managers --------
  // Contains all entities (accounts, characters, rooms, etc.).
  protected entityManager = new ServerEntityManager(this.timeOfBoot);

  // Contains prototype entities.
  protected prototypeManager = new ServerPrototypeManager();

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

  /*
  public static get prototypeManager()
  {
    return ServerApp.getInstance().prototypeManager;
  }
  */

  // ---------------- Static methods --------------------

  // Loads the game (or creates a new default one
  // if there is no ./data directory).
  public static async run(telnetPort: number)
  {
    if (this.instanceExists())
    {
      ERROR("Instance of ServerApp already exists."
        + "ServerApp.run() can only be called once");
      return;
    }

    // Create an instance of ServerApp.
    this.createInstance();

    await ServerApp.getInstance().run(telnetPort);
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
  public static onCharacterCreation(character: ServerGameEntity)
  {
    ServerApp.getInstance().adminList.onCharacterCreation(character);
  }

  public static getAdminLevel(entity: ServerGameEntity)
  {
    return ServerApp.getInstance().adminList.getAdminLevel(entity);
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
    /// TODO: motd by se mělo savovat na disk - tj. ideálně by to
    /// měla být property nejaké entity (třeba config).
    let motd = ServerApp.getInstance().messageOfTheDay;

    if (motd === null)
      return "There is no message of the day at this time.";

    return "&gMessage of the day:\n&_" + motd;
  }

  // Overrides App.createInstance().
  // Creates an instance of a server. Server is a singleton, so it must
  // not already exist.
  protected static createInstance()
  {
    if (App.instance !== null)
    {
      ERROR("Server already exists, not creating it");
      return;
    }

    App.instance = new ServerApp();
  }

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  // Overrides App.reportError().
  // Reports error message and stack trace.
  // (Don't call this method directly, use ERROR()
  //  from /shared/lib/error/ERROR).
  protected reportError(message: string)
  {
    let errorMsg = message + "\n"
    + Syslog.getTrimmedStackTrace(Syslog.TrimType.ERROR);

    Syslog.log(errorMsg, MessageType.RUNTIME_ERROR, AdminLevel.ELDER_GOD);
  }

  // Overrides App.reportFatalError().
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
      MessageType.FATAL_RUNTIME_ERROR,
      AdminLevel.IMMORTAL
    );

    // Because promises are eating exceptions, throwing an error won't stop
    // the program if FATAL_ERROR() is called from within asynchronous method.
    // So we rather print stack trace ourselves (using Syslog.log() above)
    // and exit the program manually.
    process.exit(1);
  }

  // Overrides App.syslog().
  protected syslog
  (
    text: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  {
    return ServerSyslog.log(text, msgType, adminLevel);
  }

  // --------------- Private methods --------------------

  // Loads the game (or creates a new default one
  // if there is no ./data directory).
  private async run(telnetPort: number)
  {
    // Create an entity for each entity class registered in
    // ClassFactory so they can be used as prototype objects
    // for other entities.
    //   As a side effect, we get a list of names of entity
    // classes registered in ClassFactory.
    let entityClasses = ClassFactory.createRootEntities();

    // We must check if './data/' directory exists before
    // initPrototypes() is called, because it will be created
    // there it doesn't exist.
    let dataExists = await FileManager.doesDataDirectoryExist();

    // Create root prototype entities if they don't exist yet or load
    // them from disk. Then recursively load all prototype entities
    // inherited from them.
    await this.prototypeManager.initPrototypes(entityClasses);

    // If /server/data/ directory didn't exist, create and save a new world.
    if (!dataExists)
      await this.createDefaultData();
    else
      await this.loadData();

    this.startTelnetServer(telnetPort);
    /// Http server also starts a websocket server inside it.
    this.startHttpServer();
  }

  private startTelnetServer(telnetPort: number)
  {
    if (this.telnetServer.isOpen === true)
    {
      ERROR("Telnet server is already running");
      return;
    }

    this.telnetServer.start();
  }

  private startHttpServer()
  {
    if (this.httpServer.isOpen === true)
    {
      ERROR("Http server is already running");
      return;
    }

    this.httpServer.start();
  }

  private async createDefaultData()
  {
    // Mark flagNamesManager as ready without loading from file
    // (there is nowhere to load it from so we will just start
    //  with empty instance).
    this.flagNamesManager.ready = true;
    await this.flagNamesManager.save();

    await this.game.createDefaultWorld();
  }

  private async loadData()
  {
    await this.flagNamesManager.load();
    this.flagNamesManager.ready = true;

    // Load the game.
    await this.game.load();
  }
}