/*
  Part of BrutusNEXT

  Abstract ancestor for ClientApp and ServerApp.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Entities} from '../../../shared/lib/entity/Entities';
import {Prototypes} from '../../../shared/lib/entity/Prototypes';

export abstract class App
{
  // -------------- Static class data -------------------

  protected static instance: App;

  // ---------------- Protected data --------------------

  protected isRunning = false;

  protected abstract entities: Entities;
  protected abstract prototypes: Prototypes;

  // --------------- Static accessors -------------------

  public static get entities()
  {
    return this.instance.entities;
  }

  public static get prototypes()
  {
    return this.instance.prototypes;
  }

  // ------------- Public static methods ---------------- 

  // Reports runtime error.
  // (Don't call this directly, use ERROR() instead.)
  public static reportError(message: string): void
  {
    /// Změna: Instance vždycky existuje.
    /*
    // If ERROR() is called from within an initialization
    // of App instance, the instance of App doesn't exist
    // yet so we can only report it directly.
    if (!this.instance)
    {
      throw new Error
      (
        '[ERROR triggered prior to App.createInstance()]: ' + message
      );
    }
    else
    {
      this.instance.reportError(message);
    }
    */

    this.instance.reportError(message);
  }

  // Reports fatal runtime error.
  // (Don't call this directly, use FATAL_ERROR() instead.)
  public static reportFatalError(message: string): void
  {
    /// Změna: Instance vždycky existuje.
    /*
    // If FATAL_ERROR() is called from within an initialization
    // of App instance, the instance of App doesn't exist yet so
    // we can only report it directly.  
    if (!this.instance)
    {
      throw new Error
      (
        '[ERROR triggered prior to App.createInstance()]: ' + message
      );
    }
    else
    {
      this.instance.reportFatalError(message);
    }
    */

    this.instance.reportFatalError(message);
  }

  // Sends message to syslog.
  // (Don't call this directly, use Syslog.log() instead.)
  public static syslog
  (
    text: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  : void
  {
    this.instance.syslog(text, msgType, adminLevel);
  }

  // ------------ Protected static methods --------------

  /// To be deleted.
  /*
  // -> Returns ServerApp or ClientApp. In the server code,
  //    this.instance is actually an instance of ServerApp
  //    and in client code, it's an instance of ClientApp.
  protected static getInstance(): App
  {
    if (!this.instance)
    {
      // We can't use ERROR() here because ERROR() is handled by App
      // which doesn't exist here.
      throw new Error("Instance of App doesn't exist yet");
    }

    return this.instance;
  }
  */

  // --------------- Protected methods ------------------

  // Reports runtime error.
  protected abstract reportError(message: string): void;
  // Reports fatal runtime error.
  protected abstract reportFatalError(message: string): void;

  protected abstract syslog
  (
    message: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  : void;

  protected isAlreadyRunning(): boolean
  {
    if (this.isRunning)
    {
      // 'this.constructor.name' is the name of the class.
      ERROR("Attempt to run " + this.constructor.name
        + " which is already running");
      return true;
    }

    this.isRunning = true;

    return false;
  }

  protected initClasses()
  {
    // Create an instance of each entity class registered in
    // Classes so they can be used as prototype objects
    // for root prototype entities.
    this.entities.createRootObjects();
  }
}
