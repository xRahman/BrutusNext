/*
  Part of BrutusNEXT

  Implements game server.

  Server is a singleton, you can access the instance by Server.getInstance().

  Usage:
    import {Server} from './server/Server';
    Server.create();   // Creates an instance.
    Server.getInstance().run(port); // Specify telnet port number to listen on.

  Server creates and runs it's own game when you .run() it.
*/

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Mudlog} from '../server/Mudlog';
import {Players} from '../server/Players';
import {Game} from '../game/Game';
import {TelnetServer} from '../server/telnet/TelnetServer';

export class Server
{
  // -------------- static members -------------

  static get DEFAULT_TELNET_PORT() { return 4443; }

  static getInstance()
  {
    ASSERT_FATAL(
      Server.myInstance !== null && Server.myInstance !== undefined,
      "Instance of server doesn't exist yet");
    return Server.myInstance;
  }

  // Creates an instance of a server. Server is a singleton, so it must
  // not already exist.
  static create()
  {
    if (!ASSERT(Server.myInstance === undefined,
      "Server already exists, not creating it"))
      return;

    Server.myInstance = new Server();
  }

  protected static myInstance: Server;

  // -------------- public members -------------

  public get game() { return this.myGame; }
  public get players() { return this.myPlayers; }

  get telnetServer()
  {
    ASSERT_FATAL(
      this.myTelnetServer !== null && this.myTelnetServer !== undefined,
      "Telnet server doesn't exist yet");
    return this.myTelnetServer;
  }

  // Starts the server. This is not a static method so it needs
  // to be called on Server.getInstance().
  public run(telnetPort: number)
  {
    this.startGame();
    this.startTelnetServer(telnetPort);

    Mudlog.log(
      "We are up and running at port: " + telnetPort,
      Mudlog.msgType.SYSTEM_INFO,
      Mudlog.levels.IMMORTAL);
      
    ASSERT_FATAL(false, "Test assert");
  }

  // ------------ protected members -------------

  protected myGame: Game;
  protected myPlayers: Players;
  protected myTelnetServer: TelnetServer;

  // Creates an instance of telnet server and starts it.
  protected startTelnetServer(telnetPort: number)
  {
    if (!ASSERT(
          this.myTelnetServer === undefined || this.myTelnetServer === null,
          "Telnet server already exists"))
      return;
    this.myTelnetServer = new TelnetServer(telnetPort);
    this.myTelnetServer.start(telnetPort);
  }

  // Creates an instance of the game and loads its state from the disk.
  protected startGame()
  {
    if (!ASSERT(this.myGame === undefined, "Game already exists"))
      return;

    this.myGame = new Game();

    // Load the game.
    this.myGame.load();
  }
}
