/*
  Part of BrutusNEXT

  Implements game server.

  Server is a singleton, you can access the instance by Server.getInstance()

  Usage:
    import {GameServer} from './server/GameServer';
    GameServer.create(); // Creates an instance.
    GameServer.getInstance().run(port);
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
import {Account} from '../server/Account';

export class Server
{
  constructor()
  {
    this.myTimeOfBoot = new Date();
  }

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
  public static get descriptorManager()
  {
    return Server.getInstance().myDescriptorManager;
  }
  public static get telnetServer()
  {
    return Server.getInstance().myTelnetServer;
  }

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

  // Starts the server. This is not a static method so it needs
  // to be called on Server.getInstance().
  public run(telnetPort: number)
  {
    
    /// TESTING:
    /*
    let tmp = new Account("test");
    
    tmp.loadFromFile('./data/accounts/test.json');
    console.log("X is " + tmp.myData.x);
    */
    ///tmp.saveToFile('./data/accounts/test.json');
    


    this.startGame();
    this.startTelnetServer(telnetPort);
  }

  // ------------ protected members -------------

  protected myGame: Game = new Game();
  protected myAccountManager: AccountManager =
    new AccountManager();
  protected myDescriptorManager: DescriptorManager =
    new DescriptorManager();
  protected myTelnetServer: TelnetServer =
    new TelnetServer(Server.DEFAULT_TELNET_PORT, this.myDescriptorManager);

  protected myTimeOfBoot = null;

  // Creates an instance of telnet server and starts it.
  protected startTelnetServer(telnetPort: number)
  {
    ASSERT_FATAL(this.myTelnetServer.open === false,
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
