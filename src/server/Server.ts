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

import {ERROR} from '../shared/error/ERROR';
import {FATAL_ERROR} from '../shared/error/FATAL_ERROR';
import {EntityManager} from '../shared/entity/EntityManager';
import {FileSystem} from '../shared/fs/FileSystem';
import {FlagNamesManager} from '../shared/flags/FlagNamesManager';
import {AdminList} from '../server/AdminList';
import {Connection} from '../server/connection/Connection';
import {EntityList} from '../shared/entity/EntityList';
import {ClassFactory} from '../shared/ClassFactory';
import {AccountList} from '../server/account/AccountList';
import {Game} from '../game/Game';
import {GameEntity} from '../game/GameEntity';
import {TelnetServer} from '../server/net/telnet/TelnetServer';
import {HttpServer} from '../server/net/http/HttpServer';
import {Account} from '../server/account/Account';

export class Server
{
  // -------------- Static class data -------------------

  protected static instance: Server;

  // -------------- Private class data -----------------

  // Keeps track of who has which admin rights.
  private adminList = new AdminList();

  private timeOfBoot = new Date();

  // Allows creation of new classes in runtime.
  private classFactory = new ClassFactory();

  // --- singleton instances ---
  // (There is only one such instance per server.)

  private game = null;
  private telnetServer = new TelnetServer(Server.DEFAULT_TELNET_PORT);
  private httpServer = new HttpServer(Server.DEFAULT_HTTP_PORT);
  
  // --------- idLists ---------
  // IdLists contain entity id's.

  private connections = new EntityList();
  private accounts = new AccountList();

  // -------- managers --------
  // Unlike idLists, managers store actual instances, not just references.

  // Contains all entities (accounts, connections, all game entities).
  private entityManager = new EntityManager(this.timeOfBoot);

  // flagNamesManager is in Server instead of Game, because flags are needed
  // even outside of game (for example account flags).
  private flagNamesManager = new FlagNamesManager();

  // --------------- Static accessors -------------------

  // These are shortcuts so you don't have to use Server.getInstance()

  public static get timeOfBoot()
  {
    if (Server.getInstance().timeOfBoot === null)
      ERROR("Time of boot is not initialized yet");

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

  public static get entityManager()
  {
    return Server.getInstance().entityManager;
  }

  public static get classFactory()
  {
    return Server.getInstance().classFactory;
  }

  public static get DEFAULT_TELNET_PORT() { return 4443; }
  public static get DEFAULT_HTTP_PORT() { return 4445; }


  // ---------------- Static methods --------------------

  public static getInstance()
  {
    if (Server.instance === null || Server.instance === undefined)
      FATAL_ERROR("Instance of server doesn't exist yet");

    return Server.instance;
  }

  public static getAdminLevel(entity: GameEntity)
  {
    return Server.getInstance().adminList.getAdminLevel(entity);
  }

  // Creates an instance of a server. Server is a singleton, so it must
  // not already exist.
  public static create()
  {
    if (Server.instance !== undefined)
    {
      ERROR("Server already exists, not creating it");
      return;
    }

    Server.instance = new Server();
  }

  // Creates an array 
  public static getGlobalMessageRecipients()
  {

  }

  // ---------------- Public methods --------------------

  // Loads the game (or creates a new one if there is no ./data directory).
  public async run(telnetPort: number)
  {
    ///test();

    if (this.game !== null)
    {
      ERROR("Game already exists. Server.run() can only be done once");
      return;
    }

    this.game = new Game();

    await test();

    /// DEBUG:
    console.log("Server.run()");

    /*
    // If 'data' directory doesn't exist at all, create and save a new world.
    if (!FileSystem.existsSync("./data/"))
    {
    */
      // Flag flagNamesManager as ready without loading from file
      // (there is nowhere to load it from so we will just start
      //  with empty instance).
      this.flagNamesManager.ready = true;

      await this.game.createDefaultWorld();
    /*
    }
    else
    {
      await this.flagNamesManager.load();
      this.flagNamesManager.ready = true;

      // Load the game.
      await this.game.load();
    }
    */

    this.startTelnetServer(telnetPort);
    this.startHttpServer();
  }

  // --------------- Protected methods ------------------

  // Creates an instance of telnet server and starts it.
  protected startTelnetServer(telnetPort: number)
  {
    if (this.telnetServer.isOpen === true)
    {
      ERROR("Telnet server is already running");
      return;
    }

    this.telnetServer.start();
  }

  // Creates an instance of http server and starts it.
  protected startHttpServer()
  {
    if (this.httpServer.isOpen === true)
    {
      ERROR("Http server is already running");
      return;
    }

    this.httpServer.start();
  }
}

// -------------- TEST ----------------------


/*
// This module allows using new ES6 Proxy API through old harmony API
// (it allows us to call 'new Proxy(target, handler)').
var Proxy = require(harmony-proxy');
*/


///import {EntityProxyHandler} from '../shared/entity/EntityProxyHandler';

/*
class PEntity
{
  public x = 3;

  public getThis()
  {
    return this;
  }
}

class PHandler
{
  public entity = null;

  public get(target: any, property: any)
  {
    console.log("PHandler.get()");

    return this.entity[property];
  }
}
*/

///import {NamedEntity} from '../shared/entity/NamedEntity';
///import {SaveableObject} from '../shared/fs/SaveableObject';

async function delay(miliseconds: number)
{
  return new Promise<void>
  (
    resolve =>
    {
        setTimeout(resolve, miliseconds);
    }
  );
}

async function test()
{
  let account = EntityManager.createNamedEntity
  (
    "Test",
    'Account',
    Account
  );

  let tmp = account;

  console.log("----------- Before comparison ------------");

  if (account === tmp)
    console.log("References are the same");

  console.log("----------- After comparison ------------");

  /*
  let weakMap = new WeakMap();

  weakMap.set(account, "blah");

  account = null;

  console.log(">>>>> TEST: " + weakMap.has(account));
  console.log(">>>>> TEST: " + weakMap.has(tmp));
  */

  /*
  let entityList = new Map();
  let reference = {};
  let id = { id: "id" };

  entityList.set("id", id);

  let weakMap = new WeakMap();
  
  weakMap.set(id, reference);

  ///console.log(">>>>> TEST: " + weakMap.length);

  reference = null;

  await delay(2000);

  console.log(">>>>> TEST: " + weakMap.get(id));
  */


  /*
  let account = EntityManager.createNamedEntity
  (
    "Test",
    'Account',
    Account
  );

  //Server.entityManager.remove(account);

  console.log("Property list:");

  for (let property in account)
  {
    console.log("property: " + property);
  }

  let x = account['blah'];
  account['blah'] = 13;

  ///console.log("Before remove");

  Server.entityManager.remove(account);

  ///console.log("Account in EntityManager after remove: "
  ///  + Server.entityManager.has(account.getId()));

  account['blah']();
  */

  /*
  // Create a new world prototype.
  Game.prototypeManager.createPrototype('BrutusWorld', 'World');

  let entity = SaveableObject.createInstance
    ({ className: 'BrutusWorld', typeCast: NamedEntity });

  if (entity instanceof NamedEntity)
  {
    console.log("Entity is an instance of NamedEntity");
  }
  else
  {
    console.log("No luck :\\");
  }
  */

  /*
  let entity = new PEntity();
  let handler = new PHandler();
  let proxy = new Proxy({}, handler);

  handler.entity = entity;

//  console.log("X: " + proxy.x);

  console.log("Before getThis()");

  let anotherRef = proxy.getThis();

  console.log("After getThis()");

  console.log("X: " + anotherRef.x);
  */
  


  //let entity1 =
  //{
  //  x: 1,
  //  fce: function() { console.log("fce entity1"); }
  //};

  //let entity2 =
  //{
  //  x: 2,
  //  fce: function() { console.log("fce entity2"); }
  //};

  //let handler = new EntityProxyHandler();

  //let proxy = new Proxy({}, handler);

  ///*
  //handler.entity = entity1;

  //console.log("Proxy1.x = " + proxy.x);
  //proxy.fce();
  //*/

  //handler.entity = null;

  //proxy.fce();
  //proxy.y = 13;
  //let tmp = proxy.x;
  //tmp = proxy.i;

  /*
  console.log("Proxy_null.x = " + proxy.x);
  proxy.fce();

  let tmp = proxy.x;
  console.log("Tmp: " + tmp);
  tmp();
  tmp.z = 11;
  let tmp2 = tmp;
  console.log("Tmp2: " + tmp);

  proxy.y = 13;

  handler.entity = entity2;

  console.log("Proxy2.x = " + proxy.x);
  proxy.fce();
  */
}