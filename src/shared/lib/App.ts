/*
  Part of BrutusNEXT

  Implements game server.

  Server is a singleton, you can access the instance by Server.getInstance()

  Usage:
    import {Server} from './server/Server';
    Server.create(); // Creates an instance.
    Server.getInstance().run(port);
*/

'use strict';

// import {ERROR} from '../../server/lib/error/ERROR';
// import {FATAL_ERROR} from '../../server/lib/error/FATAL_ERROR';
// import {IdProvider} from '../../server/lib/entity/IdProvider';
// import {EntityManager} from '../../server/lib/entity/EntityManager';
// import {FileSystem} from '../../server/lib/fs/FileSystem';
// import {FlagNamesManager} from '../../server/lib/flags/FlagNamesManager';
// import {AdminList} from '../../server/lib/admin/AdminList';
// import {AdminLevel} from '../../server/lib/admin/AdminLevel';
// import {Connection} from '../../server/lib/connection/Connection';
// import {EntityList} from '../../server/lib/entity/EntityList';
// import {PrototypeManager} from '../../server/lib/prototype/PrototypeManager';
// import {AccountList} from '../../server/lib/account/AccountList';
// import {Message} from '../../server/lib/message/Message';
// import {Game} from '../../server/game/Game';
// import {GameEntity} from '../../server/game/entity/GameEntity';
// import {TelnetServer} from '../../server/lib/net/telnet/TelnetServer';
// import {WebSocketServer} from '../../server/lib/net/ws/WebSocketServer';
// import {HttpServer} from '../../server/lib/net/http/HttpServer';
// import {Account} from '../../server/lib/account/Account';

export abstract class App
{

  // -------------- Static class data -------------------

  protected static instance: App = null;

  //------------------ Private data ---------------------

  /*
  // Contains all entities (accounts, connections, all game entities).
  private entityManager = new EntityManager(this.idProvider);
  */

  // --------------- Static accessors -------------------

  // These are shortcuts so you don't have to use Server.getInstance()
  /*
  public static get entityManager()
  {
    return App.getInstance().entityManager;
  }
  */

  // ---------------- Static methods --------------------

  public static instanceExists()
  {
    return App.instance !== null && App.instance !== undefined;
  }

  // This is not an abstract method, App.getInstance() is valid call.
  // It returns Server or Client respectively, because Server.create()
  // and Client.create() set App.instance. It means that in the server
  // code, App.getInstance() is actually an instance of Server class
  // and in client code, it's an instance of Client class.
  public static getInstance(): App
  {
    if (this.instance !== null)
      return this.instance;

    // We can't use ERROR() here because ERROR() is handled by App
    // which doesn't exist here.
    throw new Error("Instance of App doesn't exist yet");
  }

  // This needs to be overriden
  // (static methods cannot be abstract in typescript).
  public static create()
  {
    // We can't use ERROR() here because ERROR() is handled by App
    // which doesn't exist here.
    throw new Error("Attempt to create() an instance of an abstract class App."
      + " Use ServerApp.create() or ClientApp.create() instead");
  }

  // ---------------- Public methods --------------------

  public abstract reportError(message: string);
  public abstract reportFatalError(message: string);

  // --------------- Protected methods ------------------
}
