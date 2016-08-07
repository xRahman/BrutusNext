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
import {EntityContainer} from '../shared/EntityContainer';
import {FileSystem} from '../shared/fs/FileSystem';
import {FlagNamesManager} from '../shared/FlagNamesManager';
import {PlayerConnection} from '../server/PlayerConnection';
import {Mudlog} from '../server/Mudlog';
import {IdList} from '../shared/IdList';
import {AccountList} from '../server/AccountList';
import {Game} from '../game/Game';
import {TelnetServer} from '../server/telnet/TelnetServer';
import {HttpServer} from '../server/http/HttpServer';
import {IdProvider} from '../shared/IdProvider';
import {Account} from '../server/Account';

export class Server
{
  // -------------- Static class data -------------------

  protected static instance: Server;

  // -------------- Private class data -----------------

  private game = null;
  private accounts = new AccountList();
  private playerConnections = new IdList();
  private telnetServer = new TelnetServer(Server.DEFAULT_TELNET_PORT);
  private httpServer = new HttpServer(Server.DEFAULT_HTTP_PORT);
  private timeOfBoot = new Date();
  private idProvider = new IdProvider(this.timeOfBoot);

  // Contains all entities that are accessible by id.
  // (all game entities, accounts, player connections, etc.)
  private entities = new EntityContainer();

  // flagNamesManager is in Server instead of Game, because flags are needed
  // even outside of game (for example account flags).
  private flagNamesManager = new FlagNamesManager();

  constructor()
  {
    /*
    // Inicializace p?esunuta rovnou do deklarace.
    this.timeOfBoot = new Date();
    this.idProvider = new IdProvider(this.timeOfBoot);
    */
  }

  // --------------- Static accessors -------------------

  // These are shortcuts so you don't need to use Server.getInstance()

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

  public static get playerConnections()
  {
    return Server.getInstance().playerConnections;
  }

  public static get telnetServer()
  {
    return Server.getInstance().telnetServer;
  }

  public static get idProvider()
  {
    return Server.getInstance().idProvider;
  }

  public static get flagNamesManager()
  {
    return Server.getInstance().flagNamesManager;
  }

  public static get entities()
  {
    return Server.getInstance().entities;
  }

  static get DEFAULT_TELNET_PORT() { return 4443; }
  static get DEFAULT_HTTP_PORT() { return 4445; }

  static getInstance()
  {
    ASSERT_FATAL
    (
      Server.instance !== null && Server.instance !== undefined,
      "Instance of server doesn't exist yet"
    );
    return Server.instance;
  }

  // ---------------- Static methods --------------------

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

  // Starts the server. This is not a static method so it needs
  // to be called on Server.getInstance().
  public async run(telnetPort: number)
  {
    ASSERT_FATAL(this.game === null,
      "Error: game already exists. Server::run() can only be done once");

    this.game = new Game();

    // If 'data' directory doesn't exist at all, create and save a new world.
    if (!FileSystem.existsSync("./data/"))
    {
      // Flag flagNamesManager as ready without loading from file
      // (there is nowhere to load it from so will will just start
      //  with empty instance).
      this.flagNamesManager.ready = true;

      await this.game.createDefaultGame();
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
