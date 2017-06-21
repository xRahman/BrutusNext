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
import {TelnetServer} from '../../../server/lib/net/telnet/TelnetServer';
import {HttpServer} from '../../../server/lib/net/http/HttpServer';

export class ServerApp extends App
{
  public static get DATA_DIRECTORY()
  {
    return './server/data/';
  }

  //------------------ Private data ---------------------

  // 'null' means no message of the day is set at the moment.
  private messageOfTheDay: string = null;

  private admins = new Admins();

  private timeOfBoot = new Date();

  private game = new Game();

  private telnetServer = new TelnetServer();

  /// Http server also runs a websocket server inside it.
  private httpServer = new HttpServer();

  private connections = new Connections();
  private accounts = new Accounts();

  // ~ Overrides App.entities.
  protected entities = new ServerEntities(this.timeOfBoot);

  // ~ Overrides App.prototypes.
  protected prototypes = new ServerPrototypes();

  // --------------- Static accessors -------------------

  // ~ Overrides App.entities().
  public static get entities()
  {
    return ServerApp.getInstance().entities;
  }

  // ~ Overrides App.prototypes().
  public static get prototypes()
  {
    return ServerApp.getInstance().prototypes;
  }

  public static get timeOfBoot()
  {
    if (ServerApp.getInstance().timeOfBoot === null)
    {
      ERROR("Time of boot is not initialized yet");
    }

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

  // ------------- Public static methods ----------------

  // Loads the game (or creates a new default one
  // if there is no ./data directory).
  public static async run(telnetPort: number)
  {
    if (!this.instanceExists())
    {
      ERROR("Instance of ServerApp doesn't exist yet."
        + " Use ServerApp.createInstance() before you"
        + " call ServerApp.run()");
      return;
    }
    
    // Run server application.
    await ServerApp.getInstance().run(telnetPort);
  }

  // If there are no admins yet, sets the highest possible admin rights
  // to the character (in other words, the first character created when
  // the mud is 'freshly installed' gets maximum admin rights).
  public static onCharacterCreation(character: GameEntity)
  {
    ServerApp.getInstance().admins.onCharacterCreation(character);
  }

  public static getAdminLevel(entity: GameEntity)
  {
    return ServerApp.getInstance().admins.getAdminLevel(entity);
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

  // Creates an instance of a server. Server is a singleton,
  // so it must not already exist.
  public static createInstance()
  {
    if (App.instance !== null)
    {
      ERROR("Server already exists, not creating it");
      return;
    }

    App.instance = new ServerApp();
  }

  // ------------ Protected static methods --------------

  // -> Returns the ServerApp singleton instance.
  protected static getInstance(): ServerApp
  {
    if (ServerApp.instance === null || ServerApp.instance === undefined)
    {
      FATAL_ERROR("Instance of server doesn't exist yet");
    }

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
    ///test();

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
    if (this.telnetServer.isOpen())
    {
      ERROR("Telnet server is already running");
      return;
    }

    this.telnetServer.start();
  }

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



///////////////////////////////////////////////

/*
/// Test pojmenovaných parametrů s defaultní hodnotou.
function createForm
(
  {
    $container = null,
    name,
    gCssClass = 'G_NoGraphics',
    sCssClass,
  }:
  {
    $container?: JQuery,
    name: string
    gCssClass?: string,
    sCssClass: string,
  }
)
{
  console.log('-----------------------------');
  console.log('Container: ' + $container);
  console.log('name: ' + name);
  console.log('gCssClass: ' + gCssClass);
  console.log('sCssClass: ' + sCssClass);
  console.log('-----------------------------');
}

function create
(
  {
    $container = null,
    name,
    gCssClass,
    sCssClass = 'S_Form'
  }:
  {
    $container?: JQuery,
    name: string,
    gCssClass?: string,
    sCssClass?: string
  }
)
{
  createForm
  (
    {
      $container,
      gCssClass,
      sCssClass,
      name
    }
  );
}

function test()
{
  create({ name: 'account_name_input' });
}
*/