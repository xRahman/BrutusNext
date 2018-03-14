/*
  Part of BrutusNEXT

  Implements game server.

  Manages an instance of server application.

  Usage:
    ServerApp.createInstance();
    ServerApp.run(port);
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {FATAL_ERROR} from '../../../shared/lib/error/FATAL_ERROR';
import {Time} from '../../../shared/lib/utils/Time';
import {App} from '../../../shared/lib/app/App';
import {ServerEntities} from '../../../server/lib/entity/ServerEntities';
import {FileSystem} from '../../../server/lib/fs/FileSystem';
import {Admins} from '../../../server/lib/admin/Admins';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Connections} from '../../../server/lib/connection/Connections';
import {ServerPrototypes} from '../../../server/lib/entity/ServerPrototypes';
import {Accounts} from '../../../server/lib/account/Accounts';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {ServerSyslog} from '../../../server/lib/log/ServerSyslog';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Game} from '../../../server/game/Game';
import {GameEntity} from '../../../server/game/GameEntity';
///import {TelnetServer} from '../../../server/lib/net/TelnetServer';
import {HttpServer} from '../../../server/lib/net/HttpServer';

export class ServerApp extends App
{
  // -------------- Static constants --------------------

  public static readonly DATA_DIRECTORY = './server/data/';

  // --------------- Static accessors -------------------

  public static get timeOfBoot() { return this.instance.timeOfBoot; }
  public static get game() { return this.instance.game; }
  public static get accounts() { return this.instance.accounts; }
  public static get connections() { return this.instance.connections; }
  public static get admins() { return this.instance.admins; }

  // --------------- Static accessors -------------------

  // ~ Overrides App.entities()
  // (Override exists in order to return type be ServerEntities.)
  public static get entities() { return this.instance.entities; }

  // ~ Overrides App.prototypes()
  // (Override exists in order to return type be ServerPrototypes.)
  public static get prototypes() { return this.instance.prototypes; }

  // -------------- Static class data -------------------

  // ~ Overrides App.instance.
  protected static instance = new ServerApp();

  // ----------------- Private data ---------------------

  // 'null' means no message of the day is set at the moment.
  private messageOfTheDay: (string | null) = null;

  private admins = new Admins();

  private timeOfBoot = new Time();

  private game = new Game();

  /// Http server also runs a websocket server inside it.
  private httpServer = new HttpServer();

  private connections = new Connections();
  private accounts = new Accounts();

  // ---------------- Protected data --------------------

  // ~ Overrides App.entities.
  protected entities = new ServerEntities(this.timeOfBoot);

  // ~ Overrides App.prototypes.
  protected prototypes = new ServerPrototypes();

  // ------------- Public static methods ----------------

  // Loads the game (or creates a new default one
  // if there is no ./data directory).
  public static async run(appName: string, version: string)
  {
    let serverApp = this.instance;

    if (serverApp.isAlreadyRunning())
      return;

    // Log our name and version.
    Syslog.log
    (
      appName + " server v. " + version,
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );

    ///test();

    serverApp.initClasses();

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
      await serverApp.createDefaultData();
    else
      await serverApp.loadData();
    
    // Http server also starts a websocket server inside it.
    serverApp.startHttpServer();
  }

  // -> Returns null if no message of the day is set at the moment.
  public static getMotd(): string
  {
    /// TODO: motd by se mělo savovat na disk - tj. ideálně by to
    /// měla být property nejaké entity (třeba config).
    let motd = this.instance.messageOfTheDay;

    if (motd === null)
      return "There is no message of the day at this time.";

    return "&gMessage of the day:\n&_" + motd;
  }

  // --------------- Protected methods ------------------

  // ~ Overrides App.reportException().
  protected reportException(error: Error): void
  {
    let errorMsg = error.message + "\n";

    if (error.stack)
      errorMsg += error.stack;
    else
      errorMsg += Syslog.STACK_IS_NOT_AVAILABLE;

    Syslog.log(errorMsg, MessageType.RUNTIME_EXCEPTION, AdminLevel.ELDER_GOD);
  }

  // ~ Overrides App.reportError().
  protected reportError(message: string): void
  {
    let stackTrace = Syslog.getTrimmedStackTrace();

    let errorMsg = message;
    
    if (stackTrace)
      errorMsg += "\n" + Syslog.getTrimmedStackTrace();

    Syslog.log(errorMsg, MessageType.RUNTIME_ERROR, AdminLevel.ELDER_GOD);
  }

  // ~ Overrides App.reportFatalError().
  // Reports error message and stack trace and terminates the program.
  // (Don't call this method directly, use FATAL_ERROR()
  //  from /shared/lib/error/ERROR).
  protected reportFatalError(message: string): void
  {
    let errorMsg = message + "\n"
      + Syslog.getTrimmedStackTrace();

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

  // ~ Overrides App.log().
  // Logs the message and sends it to all online
  // admins with sufficient 'adminLevel'.
  protected log
  (
    message: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  : void
  {
    ServerSyslog.log(message, msgType, adminLevel);
  }

  // --------------- Private methods --------------------

  private startHttpServer()
  {
    if (this.httpServer.isOpen())
    {
      ERROR("Http server is already running");
      return;
    }

    this.httpServer.start();
  }

  private async createDefaultData()
  {
    await this.game.createDefaultWorld();
  }

  private async loadData()
  {
    // Load the game.
    await this.game.load();
  }
}
