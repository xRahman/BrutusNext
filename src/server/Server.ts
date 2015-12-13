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
import {IdProvider} from '../shared/IdProvider';
import {PlayerConnectionManager} from '../server/PlayerConnectionManager';
import {Account} from '../server/Account';

export class Server
{
  constructor()
  {
    this.myTimeOfBoot = new Date();
  }

  // --------------- Static accessors -------------------

  // These are actually shortcuts so you don't need to use Server.getInstance()

  public static get timeOfBoot()
  {
    ASSERT(Server.getInstance().myTimeOfBoot != null,
      "Time of boot is not initialized yet");
    return Server.getInstance().myTimeOfBoot;
  }
  public static get game()
  {
    return Server.getInstance().myGame;
  }
  public static get accountManager()
  {
    return Server.getInstance().myAccountManager;
  }
  public static get playerConnectionManager()
  {
    return Server.getInstance().myPlayerConnectionManager;
  }
  public static get telnetServer()
  {
    return Server.getInstance().myTelnetServer;
  }

  static get DEFAULT_TELNET_PORT() { return 4443; }

  static getInstance()
  {
    ASSERT_FATAL(
      Server.myInstance !== null && Server.myInstance !== undefined,
      "Instance of server doesn't exist yet");
    return Server.myInstance;
  }

  // ---------------- Static methods --------------------

  // Creates an instance of a server. Server is a singleton, so it must
  // not already exist.
  static create()
  {
    if (!ASSERT(Server.myInstance === undefined,
      "Server already exists, not creating it"))
      return;

    Server.myInstance = new Server();
  }

  // -------------- Static class data -------------------

  protected static myInstance: Server;

  // ---------------- Public methods --------------------

  // Starts the server. This is not a static method so it needs
  // to be called on Server.getInstance().
  public run(telnetPort: number)
  {
    this.startGame();
    this.startTelnetServer(telnetPort);
  }

  // -------------- Protected class data ----------------

  protected myGame = new Game();
  protected myAccountManager = new AccountManager();
  protected myPlayerConnectionManager = new PlayerConnectionManager();
  protected myTelnetServer = new TelnetServer(Server.DEFAULT_TELNET_PORT);
  protected myTimeOfBoot = null;

  // --------------- Protected methods ------------------

  // Creates an instance of telnet server and starts it.
  protected startTelnetServer(telnetPort: number)
  {
    ASSERT_FATAL(this.myTelnetServer.isOpen === false,
      "Telnet server is already running");

    this.myTelnetServer.start();
  }

  // Creates an instance of the game and loads its state from the disk.
  protected startGame()
  {
    // TODO: Check, ze hra jeste neni loadnuta

    // Load the game.
    this.myGame.load();
  }
}
