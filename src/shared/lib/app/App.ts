/*
  Part of BrutusNEXT

  Abstract ancestor for ClientApp and ServerApp.
*/

'use strict';

import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {EntityManager} from '../../../shared/lib/entity/EntityManager';
import {PrototypeManager} from '../../../shared/lib/entity/PrototypeManager';

export abstract class App
{
  // -------------- Static class data -------------------

  protected static instance: App = null;

  //----------------- Protected data -------------------- 

  // Contains all entities (accounts, characters, rooms, etc.).
  protected entityManager: EntityManager = null;

  // Manages prototype entities.
  protected prototypeManager: PrototypeManager = null;

  // --------------- Static accessors -------------------

  public static getEntityManager()
  {
    return App.getInstance().entityManager;
  }

  public static getPrototypeManager()
  {
    return App.getInstance().prototypeManager;
  }

  // ------------- Public static methods ---------------- 

  public static instanceExists()
  {
    return App.instance !== null && App.instance !== undefined;
  }

  // Reports runtime error.
  // (Don't call this directly, use ERROR() instead.)
  public static reportError(message: string)
  {
    return App.getInstance().reportError(message);
  }

  // Reports fatal runtime error.
  // (Don't call this directly, use FATAL_ERROR() instead.)
  public static reportFatalError(message: string)
  {
    return App.getInstance().reportFatalError(message);
  }

  // Sends message to syslog.
  // (Don't call this directly, use Syslog.log() instead.)
  public static syslog
  (
    text: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  {
    return App.getInstance().syslog(text, msgType, adminLevel);
  }

  // ------------ Protected static methods --------------

  // -> Returns ServerApp or ClientApp. In the server code,
  //    App.getInstance() is actually an instance of ServerApp
  //    and in client code, it's an instance of ClientApp.
  protected static getInstance(): App
  {
    if (!App.instanceExists())
    {
      // We can't use ERROR() here because ERROR() is handled by App
      // which doesn't exist here.
      throw new Error("Instance of App doesn't exist yet");
    }

    return this.instance;
  }

  // --------------- Protected methods ------------------

  // Reports runtime error.
  protected abstract reportError(message: string);
  // Reports fatal runtime error.
  protected abstract reportFatalError(message: string);

  protected abstract syslog
  (
    message: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  );
}
