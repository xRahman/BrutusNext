/*
  Part of BrutusNEXT

  Implements game server.

  Server is a singleton, you can access the instance by Server.getInstance()

  Usage:
    import {GameServer} from './server/GameServer';
    GameServer.create(); // Creates an instance.
    GameServer.getInstance().run(port);
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT_FATAL';
import {IdProvider} from '../shared/IdProvider';
import {FileSystem} from '../shared/fs/FileSystem';
import {FlagNamesManager} from '../shared/FlagNamesManager';
import {Connection} from '../server/Connection';
import {Mudlog} from '../server/Mudlog';
import {IdList} from '../shared/IdList';
import {AccountList} from '../server/AccountList';
import {Game} from '../game/Game';
import {TelnetServer} from '../server/telnet/TelnetServer';
import {HttpServer} from '../server/http/HttpServer';
import {Account} from '../server/Account';

export class Server
{
  // -------------- Static class data -------------------

  protected static instance: Server;

  // -------------- Private class data -----------------

  private timeOfBoot = new Date();

  // -- singleton instances ---
  // (There is only one such instance per server.)

  private game = null;
  private telnetServer = new TelnetServer(Server.DEFAULT_TELNET_PORT);
  private httpServer = new HttpServer(Server.DEFAULT_HTTP_PORT);
  
  // -------- idLists ---------
  // IdLists contain entity id's.

  private connections = new IdList();
  private accounts = new AccountList();

  // -------- managers --------
  // Unlike idLists, managers store actual instances, not just entity ids.

  // Contains ids of all entities (accounts, connections, all game entities).
  // Each id stores it's own entity instance as id.entity (accessible
  // by id.getEntity()).
  private idProvider = new IdProvider(this.timeOfBoot);

  // flagNamesManager is in Server instead of Game, because flags are needed
  // even outside of game (for example account flags).
  private flagNamesManager = new FlagNamesManager();

  // --------------- Static accessors -------------------

  // These are shortcuts so you don't have to use Server.getInstance()

  public static get timeOfBoot()
  {
    ASSERT(Server.getInstance().timeOfBoot != null,
      "Time of boot is not initialized yet");

    return Server.getInstance().timeOfBoot;
  }

  public static get game()
  {
    return Server.getInstance().game;
  }

  public static get accounts()
  {
    return Server.getInstance().accounts;
  }

  public static get connections()
  {
    return Server.getInstance().connections;
  }

  public static get telnetServer()
  {
    return Server.getInstance().telnetServer;
  }

  public static get flagNamesManager()
  {
    return Server.getInstance().flagNamesManager;
  }

  public static get idProvider()
  {
    return Server.getInstance().idProvider;
  }

  static get DEFAULT_TELNET_PORT() { return 4443; }
  static get DEFAULT_HTTP_PORT() { return 4445; }


  // ---------------- Static methods --------------------

  static getInstance()
  {
    ASSERT_FATAL
    (
      Server.instance !== null && Server.instance !== undefined,
      "Instance of server doesn't exist yet"
    );

    return Server.instance;
  }

  // Creates an instance of a server. Server is a singleton, so it must
  // not already exist.
  static create()
  {
    if (!ASSERT(Server.instance === undefined,
      "Server already exists, not creating it"))
      return;

    Server.instance = new Server();
  }

  // ---------------- Public methods --------------------

  // Loads the game (or creates a new one if there is no ./data directory).
  public async run(telnetPort: number)
  {
    ASSERT_FATAL(this.game === null,
      "Error: game already exists. Server::run() can only be done once");

    this.game = new Game();

    // If 'data' directory doesn't exist at all, create and save a new world.
    if (!FileSystem.existsSync("./data/"))
    {
      // Flag flagNamesManager as ready without loading from file
      // (there is nowhere to load it from so we will just start
      //  with empty instance).
      this.flagNamesManager.ready = true;

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
    this.startHttpServer();
  }

  // --------------- Protected methods ------------------

  // Creates an instance of telnet server and starts it.
  protected startTelnetServer(telnetPort: number)
  {
    ASSERT_FATAL(this.telnetServer.isOpen === false,
      "Telnet server is already running");

    this.telnetServer.start();
  }

  // Creates an instance of http server and starts it.
  protected startHttpServer()
  {
    ASSERT_FATAL(this.httpServer.isOpen === false,
      "Http server is already running");

    this.httpServer.start();
  }
}
