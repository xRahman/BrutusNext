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
///import {Mudlog} from '../server/Mudlog';
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

  // --- singleton instances ---
  // (There is only one such instance per server.)

  private game = null;
  private telnetServer = new TelnetServer(Server.DEFAULT_TELNET_PORT);
  private httpServer = new HttpServer(Server.DEFAULT_HTTP_PORT);
  
  // --------- idLists ---------
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
    test();

    ASSERT_FATAL(this.game === null,
      "Error: game already exists. Server::run() can only be done once");

    this.game = new Game();

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

// -------------- TEST ----------------------

/*
class InvalidValueProxyHandler
{
  /// Note: It's possible that it will be necessary to implement some
  ///   of commented-out handlers in the future, so I'll let them be here.

  //// A trap for Object.getPrototypeOf.
  //public getPrototypeOf(target)
  //{
  //}

  //// A trap for Object.setPrototypeOf.
  //public setPrototypeOf(target)
  //{
  //}

  //// A trap for Object.isExtensible.
  //public isExtensible(target)
  //{
  //}

  //// A trap for Object.preventExtensions.
  //public preventExtensions(target)
  //{
  //}

  //// A trap for Object.getOwnPropertyDescriptor.
  //public getOwnPropertyDescriptor(target)
  //{
  //}

  //// A trap for Object.defineProperty.
  //public defineProperty(target)
  //{
  //}

  //// A trap for the in operator.
  //public has(target)
  //{
  //}

  // A trap for getting property values.
  public get(target: any, property: any): any
  {
    // If someone calls 'toString()' on us.
    if (property === "toString")
      return function() { return "[InvalidFunction]"; }

    console.log("InvalidFunctionProxyHandler.get trap triggered for property: "
      + property);

    return this;
  }

  // A trap for setting property values.
  public set(target: any, property: any, value: any, receiver: any): boolean
  {
    console.log("InvalidFunctionProxyHandler.set trap triggered for property: "
      + property);

    return true;
  }


  //// A trap for the delete operator.
  //public deleteProperty(target)
  //{
  //}

  //// A trap for Object.getOwnPropertyNames.
  //public ownKeys(target)
  //{
  //}

  // A trap for a function call.
  public apply(target, thisArg, argumentsList)
  {
    console.log("InvalidFunctionProxyHandler.apply trap triggered");

    return this;
  }

  //// A trap for the new operator.
  //public construct(target)
  //{
  //}
}
*/

/*
class EntityProxyHandler
{
  public entity;

  /// Note: It's possible that it will be necessary to implement some
  ///   of commented-out handlers in the future, so I'll let them be here.

  //// A trap for Object.getPrototypeOf.
  //public getPrototypeOf(target)
  //{
  //}

  //// A trap for Object.setPrototypeOf.
  //public setPrototypeOf(target)
  //{
  //}

  //// A trap for Object.isExtensible.
  //public isExtensible(target)
  //{
  //}

  //// A trap for Object.preventExtensions.
  //public preventExtensions(target)
  //{
  //}

  //// A trap for Object.getOwnPropertyDescriptor.
  //public getOwnPropertyDescriptor(target)
  //{
  //}

  //// A trap for Object.defineProperty.
  //public defineProperty(target)
  //{
  //}

  //// A trap for the in operator.
  //public has(target)
  //{
  //}

  // A trap for getting property values.
  public get(target: any, property: any)
  {
    console.log("Get trap triggered for property: " + property);

    if (this.entity !== null)
    {
      return this.entity[property];
    }
    else
    {
      console.log("Cteni ze smazane entity!");

      // TODO: N?jak poznat, co je funkce a co ne
      // (a podle toho vracet bu? function proxy nebo object proxy).
      /// A nebo možná vždycky vracet function proxy - dají se na ní
      /// zatrapovat p?ístupy stejn? jako na nonfunction proxy (nejspíš).

      
      ///return function() { };

      let invalidValueProxyHandler = new InvalidValueProxyHandler();

      /// TODO: Nevracet new Proxy, ale statickou promennou s touhle proxy.
      return new Proxy(() => { }, invalidValueProxyHandler);
    }
  }

  // A trap for setting property values.
  public set(target: any, property: any, value: any, receiver: any): boolean
  {
    console.log("Set trap triggered for property: " + property);

    if (this.entity !== null)
      this.entity[property] = value;
    else
      console.log("Zapis na smazanou entitu!");

    return true;
  }

  //// A trap for the delete operator.
  //public deleteProperty(target)
  //{
  //}

  //// A trap for Object.getOwnPropertyNames.
  //public ownKeys(target)
  //{
  //}

  //// A trap for a function call.
  //public apply(target, thisArg, argumentsList)
  //{
  //}

  //// A trap for the new operator.
  //public construct(target)
  //{
  //}
}
*/

/// Tohle je potreba jen na to, aby to prelozilo stare harmony api
/// na nove ES6 API (tj. aby šlo zavolat new Proxy(target, handler);
var Proxy = require('harmony-proxy');


import {EntityProxyHandler} from '../shared/EntityProxyHandler';


function test()
{
  let entity1 =
  {
    x: 1,
    fce: function() { console.log("fce entity1"); }
  };

  let entity2 =
  {
    x: 2,
    fce: function() { console.log("fce entity2"); }
  };

  let handler = new EntityProxyHandler();

  let proxy = new Proxy({}, handler);

  /*
  handler.entity = entity1;

  console.log("Proxy1.x = " + proxy.x);
  proxy.fce();
  */

  handler.entity = null;

  proxy.fce();
  proxy.y = 13;
  let tmp = proxy.x;
  tmp = proxy.i;


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