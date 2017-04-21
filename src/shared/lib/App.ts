/*
  Part of BrutusNEXT

  Abstract ancestor for Client and Server.
  Allows using App.getInstance() from shared code.
*/

'use strict';

import {AdminLevel} from '../../shared/lib/admin/AdminLevel';
import {MessageType} from '../../shared/lib/message/MessageType';
import {EntityManager} from '../../shared/lib/entity/EntityManager';

export abstract class App
{

  // -------------- Static class data -------------------

  protected static instance: App = null;

  protected entityManager: EntityManager = null;

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
  protected static getInstance(): App
  {
    if (App.instanceExists())
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

  public static getSaver()
  {
    return App.getInstance().saver;
  }

  public static getEntityManager()
  {
    return App.getInstance().entityManager;
  }

  public static reportError(message: string)
  {
    return App.getInstance().reportError(message);
  }

  public static reportFatalError(message: string)
  {
    return App.getInstance().reportFatalError(message);
  }

  public static syslog
  (
    text: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  {
    return App.getInstance().syslog(text, msgType, adminLevel)
  }

  // ---------------- Public methods --------------------

  protected abstract reportError(message: string);
  protected abstract reportFatalError(message: string);

  protected abstract syslog
  (
    text: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  );

  ///protected abstract getEntityManager();
  ///protected abstract getSaver();

  // --------------- Protected methods ------------------

  /// Ještě uvidím, jak to udělám
  ///protected abstract getSaver();
}
