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
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Mudlog} from '../server/Mudlog';
import {AccountManager} from '../server/AccountManager';
import {Game} from '../game/Game';
import {TelnetServer} from '../server/telnet/TelnetServer';
import {HttpServer} from '../server/http/HttpServer';
import {IdProvider} from '../shared/IdProvider';
import {PlayerConnectionManager} from '../server/PlayerConnectionManager';
import {Account} from '../server/Account';

export class Server
{
  constructor()
  {
    this.timeOfBoot = new Date();
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

  public static get accountManager()
  {
    return Server.getInstance().accountManager;
  }

  public static get playerConnectionManager()
  {
    return Server.getInstance().playerConnectionManager;
  }

  public static get telnetServer()
  {
    return Server.getInstance().telnetServer;
  }

  public static get idProvider()
  {
    return Server.getInstance().idProvider;
  }

  static get DEFAULT_TELNET_PORT() { return 4443; }
  static get DEFAULT_HTTP_PORT() { return 4445; }

  static getInstance()
  {
    ASSERT_FATAL(
      Server.instance !== null && Server.instance !== undefined,
      "Instance of server doesn't exist yet");
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

  // -------------- Static class data -------------------

  protected static instance: Server;

  // ---------------- Public methods --------------------

  // Starts the server. This is not a static method so it needs
  // to be called on Server.getInstance().
  public run(telnetPort: number)
  {
    this.startGame();
    this.startTelnetServer(telnetPort);

    this.startHttpServer();
  }

  // -------------- Protected class data ----------------

  protected idProvider = new IdProvider();
  protected game = new Game();
  protected accountManager = new AccountManager();
  protected playerConnectionManager = new PlayerConnectionManager();
  protected telnetServer = new TelnetServer(Server.DEFAULT_TELNET_PORT);
  protected httpServer = new HttpServer(Server.DEFAULT_HTTP_PORT);
  protected timeOfBoot = null;

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

  // Creates an instance of the game and loads its state from the disk.
  protected startGame()
  {
    // TODO: Check, ze hra jeste neni loadnuta

    // Load the game.
    this.game.load();
  }
}
