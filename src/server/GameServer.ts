/*
  Part of BrutusNEXT

  Implements game server.

  Server is a singleton, you can access the instance by Server.getInstance().

  Usage:
    import {Server} from './server/Server';
    Server.create();   // Creates an instance.
    Server.getInstance().run(port); // Specify telnet port number to listen on.
*/

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Mudlog} from '../server/Mudlog';
import {AccountManager} from '../server/AccountManager';
import {Game} from '../game/Game';
import {TelnetServer} from '../server/telnet/TelnetServer';
import {IdProvider} from '../shared/IdProvider';
import {DescriptorManager} from '../server/DescriptorManager';

/*
/// TESTING:
import {SaveableObject} from '../shared/SaveableObject';
*/
import {AccountData} from '../server/AccountData';

export class GameServer
{
  // -------------- static members -------------

  static get DEFAULT_TELNET_PORT() { return 4443; }

  static getInstance()
  {
    ASSERT_FATAL(
      GameServer.myInstance !== null && GameServer.myInstance !== undefined,
      "Instance of server doesn't exist yet");
    return GameServer.myInstance;
  }

  // Creates an instance of a server. Server is a singleton, so it must
  // not already exist.
  static create()
  {
    if (!ASSERT(GameServer.myInstance === undefined,
      "Server already exists, not creating it"))
      return;

    GameServer.myInstance = new GameServer();
  }

  protected static myInstance: GameServer;

  // -------------- public members -------------

  public get game() { return this.myGame; }
  public get accountManager() { return this.myAccountManager; }
  public get descriptorManager() { return this.myDescriptorManager; }
  public get telnetServer() { return this.myTelnetServer; }

  // Starts the server. This is not a static method so it needs
  // to be called on Server.getInstance().
  public run(telnetPort: number)
  {
    
    /// TESTING:

    let tmp = new AccountData('0.0');
    tmp.saveToFile('./data/accounts/test.json');
    


    this.startGame();
    this.startTelnetServer(telnetPort);
  }

  // ------------ protected members -------------

  protected myGame: Game = new Game();
  protected myAccountManager: AccountManager =
    new AccountManager(new IdProvider());
  protected myDescriptorManager: DescriptorManager =
    new DescriptorManager(new IdProvider());
  protected myTelnetServer: TelnetServer =
    new TelnetServer(GameServer.DEFAULT_TELNET_PORT);

  // Creates an instance of telnet server and starts it.
  protected startTelnetServer(telnetPort: number)
  {
    ASSERT_FATAL(this.telnetServer.open === false,
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
