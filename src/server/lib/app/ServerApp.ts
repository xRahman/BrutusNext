/*
  Part of BrutusNEXT

  Implements game server.

  Manages an instance of server application.

  Usage:
    import {ServerApp} from './server/lib/app/ServerApp';
    ServerApp.run(port);
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {App} from '../../../shared/lib/app/App';
///import {IdProvider} from '../../../server/lib/entity/IdProvider';
import {Classes} from '../../../shared/lib/class/Classes';
import {ServerEntities} from
  '../../../server/lib/entity/ServerEntities';
import {FileSystem} from '../../../server/lib/fs/FileSystem';
///import {FlagNamesManager} from '../../../server/lib/flags/FlagNamesManager';
import {AdminList} from '../../../server/lib/admin/AdminList';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Connection} from '../../../server/lib/connection/Connection';
import {Entity} from '../../../shared/lib/entity/Entity';
import {EntityList} from '../../../shared/lib/entity/EntityList';
import {ServerPrototypes} from '../../../server/lib/entity/ServerPrototypes';
import {AccountList} from '../../../server/lib/account/AccountList';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {ServerSyslog} from '../../../server/lib/log/ServerSyslog';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Game} from '../../../server/game/Game';
import {ServerGameEntity} from '../../../server/game/entity/ServerGameEntity';
import {TelnetServer} from '../../../server/lib/net/telnet/TelnetServer';
import {WebSocketServer} from '../../../server/lib/net/ws/WebSocketServer';
import {HttpServer} from '../../../server/lib/net/http/HttpServer';
import {Account} from '../../../server/lib/account/Account';

export class ServerApp extends App
{
  public static get DATA_DIRECTORY()
  {
    return './server/data/';
  }

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
  // ~ Overrides App.entities.
  protected entities = new ServerEntities(this.timeOfBoot);

  // ~ Overrides App.prototypes.
  protected prototypes = new ServerPrototypes();

  /// Deprecated
  // // flagNamesManager is in Server instead of Game, because flags are needed
  // // even outside of game (for example account flags).
  // private flagNamesManager = new FlagNamesManager();

  // --------------- Static accessors -------------------

  public static getEntities()
  {
    return this.getInstance().entities;
  }

  public static getPrototypes()
  {
    return this.getInstance().prototypes;
  }

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

  /// Deprecated
  // public static get flagNamesManager()
  // {
  //   return ServerApp.getInstance().flagNamesManager;
  // }

  // ------------- Public static methods ---------------- 

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

    // Create the singleton instance of ServerApp.
    this.createInstance();

    // Run server application.
    await ServerApp.getInstance().run(telnetPort);
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

  // ------------ Protected static methods --------------

  // Creates an instance of a server. Server is a singleton,
  // so it must not already exist.
  protected static createInstance()
  {
    if (App.instance !== null)
    {
      ERROR("Server already exists, not creating it");
      return;
    }

    App.instance = new ServerApp();
  }

  // -> Returns the ServerApp singleton instance.
  protected static getInstance(): ServerApp
  {
    if (ServerApp.instance === null || ServerApp.instance === undefined)
      FATAL_ERROR("Instance of server doesn't exist yet");

    // We can safely typecast here, because ServerApp.createInstance()
    // assigns an instance of ServerApp to App.instance.
    return <ServerApp>App.instance;
  }

  // ---------------- Public methods --------------------

  // --------------- Protected methods ------------------

  // ~ Overrides App.reportError().
  // Reports error message and stack trace.
  // (Don't call this method directly, use ERROR()
  //  from /shared/lib/error/ERROR).
  protected reportError(message: string)
  {
    let errorMsg = message + "\n"
    + Syslog.getTrimmedStackTrace(Syslog.TrimType.ERROR);

    Syslog.log(errorMsg, MessageType.RUNTIME_ERROR, AdminLevel.ELDER_GOD);
  }

  // ~ Overrides App.reportFatalError().
  // Reports error message and stack trace and terminates the program.
  // (Don't call this method directly, use FATAL_ERROR()
  //  from /shared/lib/error/ERROR).
  protected reportFatalError(message: string)
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

  // ~ Overrides App.syslog().
  // Logs the message and sends it to all online
  // admins with sufficient 'adminLevel'.
  protected syslog
  (
    message: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  {
    return ServerSyslog.log(message, msgType, adminLevel);
  }

  // --------------- Private methods --------------------

  // Loads or reates the data and starts the server application.
  private async run(telnetPort: number)
  {
    // Create an instance of each entity class registered in
    // Classes so they can be used as prototype objects
    // for root prototype entities.
    this.entities.createRootObjects();

    // We need to check if './data/' directory exists before
    // initPrototypes() is called, because it will be created
    // there it doesn't exist.
    let dataExists = await FileSystem.exists(ServerApp.DATA_DIRECTORY);

    // Create root prototype entities if they don't exist yet or load
    // them from disk. Then recursively load all prototype entities
    // inherited from them.
    await this.prototypes.init();

    // If /server/data/ directory didn't exist, create and save a new world.
    if (!dataExists)
      await this.createDefaultData();
    else
      await this.loadData();

    this.startTelnetServer(telnetPort);
    
    // Http server also starts a websocket server inside it.
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
    /// Deprecated.
    /*
    // Mark flagNamesManager as ready without loading from file
    // (there is nowhere to load it from so we will just start
    //  with empty instance).
    this.flagNamesManager.ready = true;
    await this.flagNamesManager.save();
    */

    await this.game.createDefaultWorld();
  }

  private async loadData()
  {
    /// Deprecated.
    /*
    await this.flagNamesManager.load();
    this.flagNamesManager.ready = true;
    */

    // Load the game.
    await this.game.load();
  }
}